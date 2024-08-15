import axios from "axios";

export default class HttpAdapter {
    async get(url, params) {
        const response = await axios.get(url, { params });
        return response.data;
    }

    async post(url, params) {
        const response = await axios.post(url, { params });
        return response.data;
    }

    async upload(url, file) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(url, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
        });
        return response.data;
    }
}
