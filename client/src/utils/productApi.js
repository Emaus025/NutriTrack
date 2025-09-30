import axios from 'axios';

// API para buscar productos por código de barras
// Utilizamos Open Food Facts API que es gratuita y abierta
const API_BASE_URL = 'https://world.openfoodfacts.org/api/v0/product/';

export async function searchProductByBarcode(barcode) {
  try {
    const response = await axios.get(`${API_BASE_URL}${barcode}.json`);
    
    if (response.data && response.data.status === 1) {
      const product = response.data.product;
      
      // Extraer información nutricional
      return {
        id: barcode,
        name: product.product_name || 'Producto desconocido',
        brand: product.brands || '',
        calories: parseFloat(product.nutriments['energy-kcal_100g']) || 0,
        protein: parseFloat(product.nutriments.proteins_100g) || 0,
        carbs: parseFloat(product.nutriments.carbohydrates_100g) || 0,
        fat: parseFloat(product.nutriments.fat_100g) || 0,
        image: product.image_url || null,
        quantity: 1,
        serving_size: product.serving_size || '100g',
      };
    } else {
      throw new Error('Producto no encontrado');
    }
  } catch (error) {
    console.error('Error al buscar producto:', error);
    
    // Si la API falla, devolvemos un producto genérico
    return {
      id: barcode,
      name: `Producto (${barcode})`,
      brand: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      image: null,
      quantity: 1,
      serving_size: '100g',
    };
  }
}

// Función para buscar productos por nombre
export async function searchProductsByName(query) {
  try {
    const response = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&json=1`);
    
    if (response.data && response.data.products) {
      return response.data.products.slice(0, 10).map(product => ({
        id: product.code,
        name: product.product_name || 'Producto desconocido',
        brand: product.brands || '',
        calories: parseFloat(product.nutriments['energy-kcal_100g']) || 0,
        protein: parseFloat(product.nutriments.proteins_100g) || 0,
        carbs: parseFloat(product.nutriments.carbohydrates_100g) || 0,
        fat: parseFloat(product.nutriments.fat_100g) || 0,
        image: product.image_url || null,
        quantity: 1,
        serving_size: product.serving_size || '100g',
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error al buscar productos:', error);
    return [];
  }
}