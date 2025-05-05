import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { Order } from './orders.model';
import Product from '../product/product.model';
import Cart from '../cart/cart.model';
import { User } from '../user/user.models';

const orderCreateService = async (payload: any) => {
  console.log('payload==', payload);

  const user = await User.findById(payload.customerId);
  if (!user) {
    throw new AppError(400, 'Customer is not found!');
  }

  if (user.role !== 'customer') {
    throw new AppError(400, 'User is not authorized as a User!!');
  }

  const cartItems = await Cart.find({ customerId: payload.customerId });
  if (!cartItems) {
    throw new AppError(404, 'Cart items is not Found!!');
  }

  console.log('cartItems==', cartItems);
  const groupedOrders: any = {};

  cartItems.forEach((item: any) => {
    const sellerId = item.sellerId;
    if (!groupedOrders[sellerId]) {
      groupedOrders[sellerId] = [];
    }
    groupedOrders[sellerId].push(item);
  });

  console.log('groupedOrders==', groupedOrders);

  const separateOrders = Object.entries(groupedOrders).map(
    ([sellerId, items]: any) => {
      return {
        sellerId,
        customerId: items[0].customerId,
        productList: items,
        totalAmount: items.reduce((sum: any, item: any) => sum + item.price, 0),
        orderDate: new Date(),
        status: 'completed',
        phone_number: payload.phone_number,
        zip_code: payload.zip_code,
        street_name: payload.street_name,
        state_code: payload.state_code,
        locality: payload.locality,
        house_number: payload.house_number,
        country: payload.country,
        address: payload.address,
      };
    },
  );
 console.log('separateOrders', separateOrders);
  const order = await Order.create(separateOrders);
  console.log('order created', order);

 

  // const productlist = await Promise.all(
  //   payload.cartIds.map(async (cartId: any) => {
  //     // const singleProduct = await Product.findById(product.productId).session(
  //     //   session,
  //     // );

  //     const cartItem = await Cart.findById(cartId);

  //     if (!cartItem) {
  //       throw new AppError(404, 'Cart is not Found!!');
  //     }

  //     const singleProduct = await Product.findById(
  //       cartItem.productId,
  //     );

  //     if (!singleProduct) {
  //       throw new AppError(404, 'Product is not Found!!');
  //     }

  //     console.log(
  //       'singleProduct==availableStock',
  //       singleProduct.availableStock,
  //     );
  //     console.log('cartItem.quantity', cartItem.quantity);

  //     if (Number(singleProduct.availableStock) < cartItem.quantity) {
  //       throw new AppError(403, 'Insufficient stock for the product!');
  //     }

  //     return {
  //       productId: cartItem.productId,
  //       price: cartItem.price * cartItem.quantity,
  //       quantity: cartItem.quantity,
  //     };
  //   }),
  // );

  // newPayload.productList = productlist;
  // newPayload.userId = payload.userId;
  // newPayload.phone_number = payload.phone_number;
  // newPayload.zip_code = payload.zip_code;
  // newPayload.street_name = payload.street_name;
  // newPayload.state_code = payload.state_code;
  // newPayload.locality = payload.locality;
  // newPayload.house_number = payload.house_number;
  // newPayload.given_name = payload.given_name;
  // newPayload.family_name = payload.family_name;
  // newPayload.country = payload.country;
  // newPayload.address2 = payload.address2;
  // newPayload.business = payload.business;

  // const totalAmount = productlist.reduce(
  //   (acc, product) => acc + product.price,
  //   0,
  // );
  // newPayload.totalAmount = totalAmount;

  // if (!payload.shippingCost) {
  //   throw new AppError(400, 'Shipping cost is required!');
  // } else {
  //   payload.shippingCost = Number(payload.shippingCost);
  // }

  // console.log('newPayload with totalAmount==', newPayload);

  // const order = await Order.create(newPayload);

  // if (!order) {
  //   throw new AppError(400, 'Failed to create order!');
  // }

  return 'order';
};

const getAllOrderByCustomerAndSellerQuery = async (query: Record<string, unknown>, userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User is not found!');
  }

  const updateRole = user.role === 'customer' ? 'customerId' : 'sellerId';
  const OrderQuery = new QueryBuilder(
    Order.find({ [updateRole]: userId }).populate('productList.productId'),
    query,
  )
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await OrderQuery.modelQuery;

  const meta = await OrderQuery.countTotal();
  return { meta, result };
};



const getSingleOrderQuery = async (id: string) => {
  const order: any = await Order.findById(id).populate('productList.productId');
  if (!order) {
    throw new AppError(404, 'Order Not Found!!');
  }
  return order;
};

const updateSingleOrderStatusQuery = async (id: string, status: any, sellerId: string) => {
  const orderProduct: any = await Order.findById(id);
  if (!orderProduct) {
    throw new AppError(404, 'Order Product is not found!');
  }

  const seller: any = await User.findById(sellerId);
  if (!seller) {
    throw new AppError(404, 'Seller User is not found!');
  }

  if(orderProduct.sellerId.toString() !== sellerId.toString()) {
    throw new AppError(404, 'You are not valid Seller for update this order!!');  

  }

  const statusSequence: Record<string, string[]> = {
    completed: ['recived', 'cancelled'],
    recived: ['ongoing'],
    ongoing: ['delivery'],
    delivery: ['finished'],
  };

  const currentStatus = orderProduct.status;

  if (!statusSequence[currentStatus]?.includes(status)) {
    throw new AppError(
      400,
      `Invalid status update! You cannot change the status from ${currentStatus} to ${status}.`,
    );
  }

  const updateHistory = orderProduct.history.find(
    (oldHis: any) => oldHis.status === status,
  );

  if (updateHistory) {
    updateHistory.date = new Date();
  }

  orderProduct.status = status;
  await orderProduct.save();

  return orderProduct;
};

const deletedOrderQuery = async (id: string, customerId: string) => {
  if (!id) {
    throw new AppError(400, 'Invalid input parameters');
  }
  const customer = await User.findById(customerId);
  if (!customer) {
    throw new AppError(404, 'Customer Not Found!!');
  }
  const order = await Order.findById(id);
  if (!order) {
    throw new AppError(404, 'Order Not Found!!');
  }

  if (order.customerId.toString() !== customerId.toString()) {
    throw new AppError(404, 'You are not valid Customer for deleted this order!!');
  }

  const result = await Order.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(404, 'Failed to delete order!');
  }

  return result;
};

export const orderService = {
  orderCreateService,
  getAllOrderByCustomerAndSellerQuery,
  getSingleOrderQuery,
  updateSingleOrderStatusQuery,
  deletedOrderQuery,
};
