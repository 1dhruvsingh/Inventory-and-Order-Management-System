class APIHandler {
    static async request(operation, data = {}) {
        try {
            const response = await fetch('db_operations.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({operation, ...data})
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return {error: true, message: 'API request failed'};
        }
    }

    static async getProducts() {
        return await this.request('get_products');
    }

    static async addProduct(productData) {
        return await this.request('add_product', productData);
    }

    // Add more methods for other operations
}

export default APIHandler;