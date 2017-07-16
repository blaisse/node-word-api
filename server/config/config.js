const dev = 'development';
var env = process.env.NODE_ENV || dev;

if(env === dev){
    const config = require('./config.json');
    var envConfig = config[env];
    // console.log(envConfig);
    Object.keys(envConfig).forEach(key => process.env[key] = envConfig[key]);
}