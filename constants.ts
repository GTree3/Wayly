
import { WashroomFeature } from './types';

export const MOCK_WASHROOMS: { type: "FeatureCollection"; features: WashroomFeature[] } = {
  "type": "FeatureCollection",
  "features": [
    { 
      "type": "Feature", 
      "properties": { 
        "fid": 1, 
        "name": "Mary Brown", 
        "women": true, 
        "men": true, 
        "unisex": true, 
        "wheelchair": false, 
        "diaper_change": true, 
        "source": "Manual", 
        "notes": "Washrooms are clean, easily accessible, no stairs, frequent potholes in area.",
        "addy": "2694 Eglinton Ave E, Scarborough, ON M1K 2S3",
        "imageUrl": "https://lh3.googleusercontent.com/gps-cs-s/AHVAweoLa7_RFWyYPMPotNeutyrmP5tpSswJ_8BC1gKCtz4-3hqKomXE42-I0wLXG8VA6Ck9MzMHySG_Rj-8xEboJg8lFLIVAeLHRWugIrf8b6UKke6DH-AgRSgdgHrZSeHDEGILEiToVA=w408-h273-k-no",
        "baseDistance": 320,
        "accessibilityScore": 65
      }, 
      "geometry": { "type": "Point", "coordinates": [ -79.248740412064024, 43.736886340577549 ] } 
    },
    { 
      "type": "Feature", 
      "properties": { 
        "fid": 2, 
        "name": "Rexall", 
        "women": false, 
        "men": false, 
        "unisex": true, 
        "wheelchair": false, 
        "diaper_change": true, 
        "source": "Manual", 
        "notes": "Frequently OUT OF ORDER, employee only washroom, store entrance at an incline.",
        "addy": "2682 Eglinton Ave E, Scarborough, ON M1K 2S3",
        "imageUrl": "https://lh3.googleusercontent.com/gps-cs-s/AHVAwepmTfL8moUIFt5OAs_a22K_9GNpVgwATDZMaO7zFkTaML6hMdfeuA1KBWJLJBDm9IdyUvdzhAW3N1GX1bS3fm7zux6bR7vwlwdY6XgQkJkZnd5PHXhZ14pY3FAUsOmiHiZMjm2ugA=w408-h544-k-no",
        "baseDistance": 280,
        "accessibilityScore": 30
      }, 
      "geometry": { "type": "Point", "coordinates": [ -79.249489125594351, 43.737408171219904 ] } 
    },
    { 
      "type": "Feature", 
      "properties": { 
        "fid": 3, 
        "name": "No Frills", 
        "women": true, 
        "men": true, 
        "unisex": true, 
        "wheelchair": true, 
        "diaper_change": true, 
        "source": "Manual", 
        "notes": "On the main floor, no stairs, frequently clean, moving vehicles present.",
        "addy": "2742 Eglinton Ave E, Scarborough, ON M1J 2C6",
        "imageUrl": "https://lh3.googleusercontent.com/gps-cs-s/AHVAweoFNNOLwcSZiVExadhEgb96prcujzYzuQ9BsucOA2vSl1bFKL5M-VFe-hGajsZq0ipx156P36iQrM4R6aopEZtYMxTwzHdlipm8rwVBeh7CXeiFi5EQirrKZn70moyTjbJQpEV3RNaJzH4F=w408-h306-k-no",
        "baseDistance": 410,
        "accessibilityScore": 95
      }, 
      "geometry": { "type": "Point", "coordinates": [ -79.246528303906203, 43.737861936995863 ] } 
    },
    { 
      "type": "Feature", 
      "properties": { 
        "fid": 4, 
        "name": "Shoppers", 
        "women": true, 
        "men": true, 
        "unisex": true, 
        "wheelchair": true, 
        "diaper_change": true, 
        "source": "Manual", 
        "notes": "At the back of the store, no stairs, moving vehicles present.",
        "addy": "2751 Eglinton Ave E, Scarborough, ON M1J 2C7",
        "imageUrl": "https://lh3.googleusercontent.com/gps-cs-s/AHVAweoHezN1x4Gu_xpT0Q8wTp_FsMCF4vwItO2nLXYI3XQAKZlUu4GiW78yxokrelxTBq5dqs3lvns6bKFoZEpEJgs1F2kGVEJrBG_YxQDriwsgFvkxv34e2sQ9CDtVt9dw4Z-SbYl_1t7NyHO4=w507-h240-k-no",
        "baseDistance": 150,
        "accessibilityScore": 90
      }, 
      "geometry": { "type": "Point", "coordinates": [ -79.247587090716792, 43.736515765193843 ] } 
    },
    { 
      "type": "Feature", 
      "properties": { 
        "fid": 5, 
        "name": "Ghareeb Nawaz Restaruant", 
        "women": true, 
        "men": true, 
        "unisex": false, 
        "wheelchair": false, 
        "diaper_change": false, 
        "source": "Manual", 
        "notes": "Not Accessible, has a flight of stairs to washroom",
        "addy": "1071 Danforth Rd, Scarborough, ON M1J 2C7",
        "imageUrl": "https://lh3.googleusercontent.com/p/AF1QipOirX-6wmVnnn9ntl_JhxVI3R8XZbman15AGkco=w408-h408-k-no",
        "baseDistance": 550,
        "accessibilityScore": 10
      }, 
      "geometry": { "type": "Point", "coordinates": [ -79.246748976694377, 43.735333356572426 ] } 
    }
  ]
};

export const INITIAL_LAT_LNG: [number, number] = [43.7368, -79.2480]; 
