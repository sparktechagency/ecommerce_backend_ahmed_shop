import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { Order } from './orders.model';

const getAllOrderQuery = async (query: Record<string, unknown>) => {
  const OrderQuery = new QueryBuilder(
    Order.find({ paymentStatus: 'paid' }).populate(
      'productList.productId',
    ),
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


const getAllOrderByUserQuery = async (userId:string, query: Record<string, unknown>) => {
  const OrderQuery = new QueryBuilder(
    Order.find({ userId: userId, paymentStatus: 'paid' }).populate(
      'productList.productId',
    ),
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

const updateSingleOrderStatusQuery = async (id: string, status: any) => {
  console.log('id', id);
  console.log('status', status);
  const orderProduct: any = await Order.findById(id);
  if (!orderProduct) {
    throw new AppError(404, 'Order Product is not found!');
  }


   const statusSequence: Record<string, string[]> = {
     completed: ['recived', 'cancelled'], 
     recived: ['ongoing'], 
     ongoing: ['delivery'], 
     delivery: ['finished'], 
   };

   const currentStatus = orderProduct.status;

   console.log('currentStatus:', currentStatus);
   console.log(
     'valid transitions for this status:',
     statusSequence[currentStatus],
   );

   if (!statusSequence[currentStatus]?.includes(status)) {
     throw new AppError(
       400,
       `Invalid status update! You cannot change the status from ${currentStatus} to ${status}.`,
     );
   }

  const updateHistory = orderProduct.history.find((oldHis:any)=> oldHis.status === status);
  console.log('updateHistory==', updateHistory);

if (updateHistory) {
  updateHistory.date = new Date();
}


    orderProduct.status = status;
  await orderProduct.save();

  return orderProduct;
};

const deletedOrderQuery = async (id: string) => {
  if (!id) {
    throw new AppError(400, 'Invalid input parameters');
  }
  const order = await Order.findById(id);
  if (!order) {
    throw new AppError(404, 'Order Not Found!!');
  }

  const result = await Order.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(404, 'Order Result Not Found !');
  }

  return result;
};

export const orderService = {
  getAllOrderQuery,
  getAllOrderByUserQuery,
  getSingleOrderQuery,
  updateSingleOrderStatusQuery,
  deletedOrderQuery,
};
