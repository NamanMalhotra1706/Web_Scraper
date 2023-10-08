"use server"

import { User } from "@/types";
import Product from "../model/product.model";
import connectToDB from "../mongoose";
import { scrapeAmazonProduct } from "./scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "./scraper/utils";
import { revalidatePath } from "next/cache";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scarpeAndStoreProduct(productUrl : string){
    if(!productUrl) return;

    try {

        connectToDB();
        const scrapedProduct = await scrapeAmazonProduct(productUrl);

        if(!scrapedProduct) return;

        let product = scrapedProduct;

        const existingProduct = await Product.findOne({ url: scrapedProduct.url });

        if(existingProduct) {
          const updatedPriceHistory: any = [
            ...existingProduct.priceHistory,
            { price: scrapedProduct.currentPrice }
          ]
    
          product = {
            ...scrapedProduct,
            priceHistory: updatedPriceHistory,
            lowestPrice: getLowestPrice(updatedPriceHistory),
            highestPrice: getHighestPrice(updatedPriceHistory),
            averagePrice: getAveragePrice(updatedPriceHistory),
          }
        }
        
        const newProduct = await Product.findOneAndUpdate({
            url:scrapedProduct.url},
            product,
            {upsert:true,new:true}); //--> Update if Doesnt Exist Than create new one
      
            revalidatePath(`/product/${newProduct._id}`);

     } catch (error:any) {
       throw new Error(`Failed to create/update product : ${error.message}`);
    }
}

export async function getProductById(productId:string){
    try {
        connectToDB();
        const product = await Product.findOne({_id:productId});
        if(!product) return null;

        return product;

    } catch (error) {
        
    }
}

export async function getAllProducts() {
  try {
    connectToDB();

    const products = await Product.find();

    return products;
  } catch (error) {
    console.log(error);
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    connectToDB();

    const currentProduct = await Product.findById(productId);

    if(!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);

    return similarProducts;
  } catch (error) {
    console.log(error);
  }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try {
    const product = await Product.findById(productId);

    if(!product) return;

    const userExists = product.users.some((user: User) => user.email === userEmail);

    if(!userExists) {
      product.users.push({ email: userEmail });

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log(error);
  }
}
