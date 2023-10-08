import axios from "axios";
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from "./utils";

export async function scrapeAmazonProduct(url:string){

    if(!url) return;

    // BrightData proxy Configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);

    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0;
    
    const options = {
        auth: {
          username: `${username}-session-${session_id}`,
          password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
      }

    try{
        // Fetch Product page
        const response = await axios.get(url, options);
        // console.log(response.data);
        const $ = cheerio.load(response.data);

        const title = $('#productTitle').text().trim();
        // The id we are passing is that we get from --> inspect krenge and jo bhi cheej chia uske id ya class jo di hai vo lelenge
        // console.log({title});

        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selectes .a-color-base'),
            $('.a-price.a-text-price')
        );

        const originalPrice = extractPrice(
           $('.a-price.a-text-price span.a-offscreen'),

        )
        
        const outOfStock = $('#availability span.a-section').text().trim().toLowerCase() ==='currently unavailable';

        const image = $('#imgBlkFront').attr('data-a-dynamic-image') ||
         $('#landingImage').attr('data-a-dynamic-image') || '{}';

         const imageUrls = Object.keys(JSON.parse(image));
        
         const currency = extractCurrency($('.a-price-symbol'));
         const discountRate = $('.savingsPercentage').text().replace(/[-%]/g,'');
         
         const description = extractDescription($); 
        // console.log({title, currentPrice,originalPrice, outOfStock, imageUrls, currency, discountRate});
        const data = {
            url,
            currency : currency || "₹",
            image:imageUrls[0],
            title,
            currentPrice:Number(currentPrice) || Number(originalPrice),
            originalPrice:Number(originalPrice) || Number(currentPrice),
            priceHistory:[],
            discountRate:Number(discountRate),
            category:'category',
            reviewsCount:0,
            isOutOfStock:outOfStock,
            description,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice),
        }
        console.log(data);
        return data;
        }
        
    catch(error:any){
        throw new Error(`Failed to scrape product: ${error.message}`);
    }
    
}