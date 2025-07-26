import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { Order } from './orders.model';
import Product from '../product/product.model';
import Cart from '../cart/cart.model';
import { User } from '../user/user.models';
// import { validate } from 'postcode-validator';
import postalCodes from 'postal-codes-js';


const orderCreateService = async (payload: any) => {
  console.log('payload==', payload);

  const user = await User.findById(payload.customerId);
  if (!user) {
    throw new AppError(400, 'Customer is not found!');
  }

  if (user.role !== 'customer') {
    throw new AppError(400, 'User is not authorized as a User!!');
  }

  console.log('dsfaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');

  const isValid = postalCodes.validate(
    payload.country_code,
    payload.postal_code,
  );

  // const isValid = validate(payload.postal_code, payload.country_code);
  console.log('isValid================', isValid);
  console.log('dsfaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-1');

  if (!isValid) {
    throw new AppError(400, 'Postal code is not valid!');
  }
  // // console.log('dsfaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-2');
  // const isValidCountry = postcodeValidatorExistsForCountry(
  //   payload.country_code,
  // );
  // console.log('isValidCountry================', isValidCountry);

  // if (!isValidCountry) {
  //   throw new AppError(400, 'Country is not valid!');
  // }

  function validateDutchPostalCode(postalCode: string) {
    const regex = /^[1-9]\d{3}\s?(?:[A-PR-TV-Z][A-Z]|S[BCE-RT-Z])$/i;
    return regex.test(postalCode);
  }

  console.log(
    '!validateDutchPostalCode(payload.postal_code)-3',
    !validateDutchPostalCode(payload.postal_code),
  );

  if (validateDutchPostalCode(payload.postal_code)) {
    throw new AppError(400, 'Invalid Dutch postal code!');
  }


  console.log('dsfafsafaf')

  const cartItems = await Cart.find({ customerId: payload.customerId });
  console.log(' cartItems==', cartItems);
  if (cartItems.length === 0) {
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
      console.log('items==', items);
      return {
        sellerId,
        shopId: items[0].shopId,
        customerId: items[0].customerId,
        productList: items,
        totalAmount: items.reduce((sum: any, item: any) => sum + item.price, 0),
        orderDate: new Date(),
        status: 'completed',
        phone_number: payload.phone_number,
        postal_code: payload.postal_code,
        state_code: payload.state_code,
        city: payload.city,
        address_line1: payload.address_line1,
        country_code: payload.country_code,
        address_line2: payload.address_line2,
      };
    },
  );
 console.log('separateOrders', separateOrders);
  const order = await Order.create(separateOrders);
  console.log('order created', order);


   const cartDeleteData = await Cart.deleteMany({
     customerId: payload.customerId,
   });
   if (!cartDeleteData) {
     throw new AppError(httpStatus.BAD_REQUEST, 'Cart deleted Failed!!');
   }

 
  return order;
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
