import axios from 'axios';

// ۱. ایجاد یک Instance اختصاصی
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // یا همان API_URL خودت
    headers: {
        'Content-Type': 'application/json',
    }
});

// ۲. Interceptor برای اضافه کردن خودکار توکن و Department-Id
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    const x_dep_id = localStorage.getItem('X-Department-Id');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (x_dep_id) {
        config.headers['X-Department-Id'] = x_dep_id;
    }
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    } else {
        config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// ۳. Interceptor برای مدیریت سراسری خطاها
api.interceptors.response.use(
    (response) => response, // اگر موفق بود، مستقیم پاس بده
    (error) => {
        const { response } = error;

        if (response) {
            // اگر خطای ۴۰۱ بود (Session منقضی شده)
            if (response.status === 401) {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
            
            // اگر خطای ۴۰۳ بود (مثلاً همان Exception که ساختیم)
            if (response.status === 403) {
                // می‌توانی از یک Toast استفاده کنی
                console.error("عدم دسترسی:", response.data.message);
            }
        }

        return Promise.reject(error); // خطا را به catch در کامپوننت بفرست
    }
);

export default api;
