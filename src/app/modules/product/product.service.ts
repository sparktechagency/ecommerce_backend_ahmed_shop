import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import Product from './product.model';
import { TProduct } from './product.interface';
import FavoriteProduct from '../favorite/favorite.model';
import { access } from 'fs/promises';
import { unlink } from 'fs/promises';
import { Category } from '../category/category.model';
// import PickupAddress from '../pickupAddress/pickupAddress.model';


const createProductService = async (payload: TProduct) => {

  // const isPickupAddressExist = await PickupAddress.findOne({});

  // if (!isPickupAddressExist) {  
  //   throw new AppError(400, 'Pickup Address is not Found!!');
  // }



  const categoryExist = await Category.findOne({
    _id: payload.categoryId,
    isActive: true,
  });
  if (!categoryExist) {
    throw new AppError(400, 'Category is not Found!!');
  }

  payload.categoryName = categoryExist.name;
  
  const result = await Product.create(payload);

  
    if (!result) {
      const imagePaths = payload.images.map(
        (image: string) => `public/${image}`,
      );

      try {
        await Promise.all(
          imagePaths.map(async (imagePath) => {
            try {
              await access(imagePath);
              await unlink(imagePath);
            } catch (error: any) {
              console.error(
                `Error handling file at ${imagePath}:`,
                error.message,
              );
            }
          }),
        );
      } catch (error: any) {
        console.error('Error deleting images:', error.message);
      }
    }

  return result;
};


const getAllProductQuery = async (query: Record<string, unknown>) => {
  console.log('query==', query);
  const productQuery = new QueryBuilder(
    Product.find({ isDeleted: false }),
    query,
  )
    .search(['name', 'details'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await productQuery.modelQuery;

  const meta = await productQuery.countTotal();
  return { meta, result };
};


const getAllProductBySellerQuery = async (query: Record<string, unknown>, userId: string) => {
  console.log('query==', query);

 
  const productQuery = new QueryBuilder(
    Product.find({ isDeleted: false, sellerId:userId }),
    query,
  )
    .search(['name', 'details'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await productQuery.modelQuery;

  const meta = await productQuery.countTotal();
  return { meta, result };
};

const getSingleProductQuery = async (id: string, userId:string) => {
    // console.log('userId=', userId);

  const product: any = await Product.findById(id);
  if (!product) {
    throw new AppError(404, 'Product Not Found!!');
  }

  console.log('product==', product._id);
  const favoriteProducts = await FavoriteProduct.find({userId});

  const isFavoriteProduct = favoriteProducts.find(
    (favorite) => favorite.productId.equals(product._id),
  );

    console.log('favoriteProducts=', favoriteProducts);

  console.log('isFavoriteProduct==', isFavoriteProduct);

  const updateData = {
    ...product._doc,
    isFavorite: isFavoriteProduct ? true : false
  };

  return updateData;
};

const updateSingleProductQuery = async (id: string, payload:any) => {
  const product: any = await Product.findById(id);
  if (!product) {
    throw new AppError(404, 'Product Not Found!!');
  }

  const { remainingUrl, ...rest } = payload;
  console.log('rest==', rest);

  const differentStock = Math.abs( product.availableStock - rest.availableStock);
  console.log('differentStock', differentStock);

  if (differentStock !== 0) {
    rest.stock = product.stock + differentStock;
  }

 console.log('rest==2', rest);
  // const availableStock = rest.availableStock;
  // console.log('availableStock==', availableStock);
  const oldImages = product.images || []; 
console.log('oldImages', oldImages);
console.log('remainingUrl', remainingUrl);
  const result = await Product.findByIdAndUpdate(
    id,
    { ...rest },
    { new: true },
  );

  if (!result) {
    throw new AppError(403, 'Product updated faield !!');
  }

   const newImages = result.images || [];
   const imagesToDelete = oldImages.filter(
     (oldImage: string) => !newImages.includes(oldImage),
   );
   console.log('imagesToDelete==', imagesToDelete);

    if (imagesToDelete.length > 0) {
      for (const image of imagesToDelete) {
        const imagePath = `public/${image}`; 
        try {
          await access(imagePath); 
          await unlink(imagePath);
          console.log(`Deleted image: ${imagePath}`);
        } catch (error: any) {
          console.error(`Error handling file at ${imagePath}:`, error.message);
        }
      }
    }

  return result;
};

const deletedProductQuery = async (id: string) => {
  if (!id) {
    throw new AppError(400, 'Invalid input parameters');
  }
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(404, 'Product Not Found!!');
  }
  if (product.isDeleted) {
    throw new AppError(404, 'Product already deleted !!');
  }

  const result = await Product.findByIdAndUpdate(
    id, 
    { isDeleted: true }, 
    { new: true }, 
  );

  if (!result) {
    throw new AppError(404, 'Product Not Found!');
  }

  return result;
};

export const productService = {
  createProductService,
  getAllProductQuery,
  getAllProductBySellerQuery,
  getSingleProductQuery,
  updateSingleProductQuery,
  deletedProductQuery,
};
