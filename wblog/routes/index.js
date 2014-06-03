/* GET home page. */
/*exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};*/
var crypto=require('crypto'),
    User=require('../models/user.js'),
    Post=require('../models/post.js');

module.exports = function(app) {
  app.get('/', function (req, res) {
    Post.get(null,function(err,posts){
      if(err){
        posts=[];
      }
      res.render('index', {
         title: '主页',
         user:req.session.user,
         posts:posts,
         success:req.flash('success').toString(),
         error:req.flash('error').toString()
      });
     });
  });
  
  app.get('/reg',checkNotLogin);
  app.get('/reg', function (req, res) {
    res.render('reg', { 
       title: '注册',
       user:req.session.user,
       success:req.flash('success').toString(),
       error:req.flash('error').toString()  
     });
  });
 
  app.post('/reg',checkNotLogin); 
  app.post('/reg', function (req, res) {
    var name=req.body.name,
        password=req.body.password,
        password_re=req.body['password-repeat'];
//检查用户两次输入密码是否相同
     if(password_re!=password){
       req.flash('error','两次输入的密码不一致！');
       return res.redirect('/reg');
     }
//生成密码md5值
     var md5=crypto.createHash('md5'),
         password=md5.update(req.body.password).digest('hex');
     var newUser=new User({
         name:name,
         password:password,
         email:req.body.email
     });
//检查用户名是否已经存在
     User.get(newUser.name,function(err,user){
       if(user){
         req.flash('error','用户已存在!');
         return res.redirect('/reg');
       }
//如果不存在就新增用户
       newUser.save(function(err,user){
         if(err){
           req.flash('error',err);
           return res.redirect('/reg');
         }
         req.session.user=user;
         req.flash('success','注册成功');
         res.redirect('/');
       });
    });     
   });

  app.get('/login',checkNotLogin);
  app.get('/login', function (req, res) {
    res.render('login', {
      title: '登录',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });

  app.post('/login',checkNotLogin);
  app.post('/login', function (req, res) {
//生成密码md5值
    var md5=crypto.createHash('md5'),
        password=md5.update(req.body.password).digest('hex');
//检查用户是否存在
    User.get(req.body.name,function(err,user){
      if(!user){
        req.flash('err','用户不存在');
        return res.redirect('/login');
      }
//检查密码是否一致
      if(user.password!=password){
        req.flash('error','密码错误');
        return res.redirect('/login');
      }
//用户名密码匹配后，将用户信息存入session
      req.session.user=user;
      req.flash('success','登陆ok!');
      res.redirect('/');
    });
  });

  app.get('/post',checkLogin);
  app.get('/post', function (req, res) {
    res.render('post',{
      title:'发表',
      user: req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });   

  app.post('/post',checkLogin);
  app.post('/post', function (req, res) {
    var currentUser=req.session.user,
        post=new Post(currentUser.name,req.body.title,req.body.post);
    post.save(function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      req.flash('success','发布成功！');
      res.redirect('/');//发表成功，跳转主页
    });

  });

  app.get('/logout',checkLogin);
  app.get('/logout', function (req, res) {
    req.session.user=null;
    req.flash('success','成功登陆');
    res.redirect('/');
  });

  function checkLogin(req,res,next){
    if(!req.session.user){
      req.flash('error','没登陆');
      res.redirect('/login');
    }
    next();
  }

  function checkNotLogin(req,res,next){
    if(req.session.user){
      req.flash('error','已经登陆');
      res.redirect('back');
    }
    next();
  }
};
