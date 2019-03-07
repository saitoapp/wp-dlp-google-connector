if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

var config = {
    app: {
        name: 'Google dlp connector'
    },
    env: process.env.ENV || '',
    port: process.env.PORT || '443',
    page_access_token: process.env.WP_PAGE_ACCESS_TOKEN || '',
    verify_token: process.env.WP_VERIFY_TOKEN || '',
    app_secret: process.env.WP_APP_SECRET || '',
};

module.exports = config;