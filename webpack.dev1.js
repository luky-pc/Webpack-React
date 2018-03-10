var pkg = require('./package.json')
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
    	index:path.resolve(__dirname, 'app/index.jsx'),
    	// 将 第三方依赖（node_modules中的） 单独打包 pkg或获取到package.json文件中的第三方依赖库Object.keys()
    	//Object.keys 返回一个所有元素为字符串的数组，其元素来自于从给定的对象上面可直接枚举的属性。这些属性的顺序与手动遍历该对象属性时的一致。
    	vendor: Object.keys(pkg.dependencies)
    },
    output: {
	    path: __dirname + "/build",    //打包后文件的输出路径
	    filename: "/js/[name].[chunkhash:8].js" //[chunkhash:8]这个是为了添加md5后缀
  	},
  	 devServer:{
        // contentBase:'./dist',  contentBase可以不用指定 因为用了这个HtmlWebpackPlugin插件
//      contentBase:path.join(__dirname, "dist"),
        inline: true,
        port:8000,
        // host: "http://localhost",
        //9.1配置后台接口
        proxy:{//代理属性
            //路由映射
            "/api":{
                target:'http://localhost:9000/',
                pathRewrite: {"^/api":""}
               	/* 因为在 ajax 的 url 中加了前缀 '/api'，而原本的接口是没有这个前缀的
				所以需要通过 pathRewrite 来重写地址，将前缀 '/api' 转为 '/'*/
            }
        }
    },
    module: {
        loaders: [
        	 //3 编译es6和编译jsx和js
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            //配置图片
			{
				test:/\.(jpg|png|gif|jpeg|bmp)$/,
				use:{
					loader:'url-loader',
					options: {
						limit: 8192,    //限制图片的大小
					 	name:'img/[name].[chunkhash:8].[ext]'
					}
				}
			},
			//配置字体图标
			{
				test:/\.(png|woff|woff2|svg|ttf|eot)$/,
				use:{
					loader:'url-loader',
					options: {
						limit: 8192  //限制大小10k
						// fonts/打包到下的fonts文件夹
                        name: 'fonts/[name].[chunkhash:8].[ext]'
					}
				}
			},
			//配置css
			{
		        test: /\.css$/,
		         use: ExtractTextPlugin.extract({
		           fallback: "style-loader",
		           use: ["css-loader",'postcss']
		        })
	      	}
			//配置scss  执行顺序是从右往走的这个顺序是不能改变的
			{
		       test: /\.scss$/,
		       use: [ 'style-loader', 'css-loader','postcss','sass-loader' ]
		    }
        ]
    },
    //添加css3兼容后缀
 	postcss: [
	    require('autoprefixer')
  	],
    // html 模板插件
    plugins: [
	    // webpack 内置的 banner-plugin
	    new webpack.BannerPlugin("Copyright by https://github.com/heyushuo."),
    	//利用webpack-html-plugin这个插件它可以生成html文件到指定的目录下，这样就可以不用再根目录下建立页面文件了，直接在src下建立模板文件，
    	new HtmlWebpackPlugin({
	        template: __dirname + '/app/index.template.html'  //默认会在build路径下生成index.html并引用所有的静态资源
	    }),
    	//提取css文件
    	new ExtractTextPlugin({
    		filename:'css/[name].[chunkhash:8].css',
            // filename:'app_[chunkhash].css',
//          disable:false,
//          allChunks:true
    	}),
    	 //7 代码优化：合并以及压缩代码
        // 开发环境暂时不需要
    	new webpack.optimize.UglifyJsPlugin({
            //输出不显示警告
            compress:{
                warnings:false //默认值
            },
            //输出去掉注释
            output:{
                comments:false  //默认值
            }
        })
    	/* new webpack.optimize.UglifyJsPlugin({
	        compress: {
	            warnings: false
	        },
	        sourceMap: true,//这里的soucemap 不能少，可以在线上生成soucemap文件，便于调试
	        mangle: true
	    })*/
    	// 提供第三方依赖的代码
	    new webpack.optimize.CommonsChunkPlugin({
	      name: 'vendor',
	    })
    	
    ]
    

}