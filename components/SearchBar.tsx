"use client"

import { scarpeAndStoreProduct } from '@/lib/actions';
import { FormEvent, useState } from 'react';

const isValidAmazonProductUrl = (url:string)=>{
    try{
      const parsedUrl=new URL(url);
      const hostname = parsedUrl.hostname;  // Url ma sa hostname nikal kr dedega ye
      
      if(hostname.includes('amazon.com') || 
         hostname.includes('amazon.' || 
         hostname.endsWith('amazon'))){
            return true;
         }
    }
    catch(err){
         console.log("Error in URL : " + err);
        return false;

    }
}

export default function SearchBar(){
    const [searchPrompt,setSearchPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e:FormEvent<HTMLFormElement>) =>{
        e.preventDefault();

        const isValidLink = isValidAmazonProductUrl(searchPrompt);

        // alert(isValidLink ? 'Valid Link' : 'InValid Link');
        if(!isValidLink){
            return alert('Please provide a Valid Amazon Link');
        }

        try{
            setIsLoading(true);

            // Scrap Data of the product
            const product = await scarpeAndStoreProduct(searchPrompt);
        }
        catch(err){
            console.log("Error while Loading : "+err);
        }
        finally{
            setIsLoading(false);
        }
    }
    return(
        <>
        <div>
            <form className="flex flex-wrap gap-4 mt-12" 
            onSubmit={handleSubmit}>
            
            <input
            type="text"
            value={searchPrompt}
            onChange={(e)=>setSearchPrompt(e.target.value)}
            placeholder="Enter Product Link"
            className="searchbar-input" />

            <button 
            className="searchbar-btn"
            type="submit"
              disabled={searchPrompt===''}>
                {isLoading ? 'Fetching Details...' : 'Search'}
            </button>
            </form>
        </div>
        </>
    )
}