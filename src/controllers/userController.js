import User from "../models/User";
import fetch from "cross-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req,res) => 
res.render("join", {pageTitle :"Join"});

export const postJoin = async (req,res) => {
    const {name, username, email, password, password2,location} = req.body;
    const pageTitle ="Join";
    console.log(req.body);
    if(password !== password2){
        return res.status(400).render("join", {pageTitle :pageTitle, errorMessage: "비밀번호가 일치하지 않습니다."});
    }
    const usernameExists = await User.exists({username});
    if(usernameExists) {
        return res.status(400).render("join", {pageTitle :pageTitle, errorMessage: "이미 사용중인 username 입니다."});
    }
    const emailExists = await User.exists({email});
    if(emailExists) {
        return res.status(400).render("join", {pageTitle :pageTitle, errorMessage: "이미 사용중인 email 입니다."});
    }
    try {
        await User.create({
            name, username, email, password, location
        });
    } catch (error) {
        return res.status(400).render("join",{pageTitle: pageTitle, errorMessage: error._message,});
    }

   return res.redirect("/");
}

export const getLogin = (req,res) => {
    res.render("login",{pageTitle: "Login"});
}
export const postLogin = async (req,res) => {
    const pageTitle ="Login"
    const {username, password} = req.body;
    const user = await User.findOne({username, socialOnly: false});
    if(!user) {
        return res.status(400).render("login",{pageTitle,errorMessage: "account does not exist"});
    }
    //check if account exists
    //check if password 
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) {
        return res.status(400).render("login",{pageTitle,errorMessage: "Wrong password"});
    }
    req.session.loggedIn=true;
    req.session.user= user;
    return res.redirect("/home");
}

export const startGithubLogin = (req,res) => {
    const baseURL = "https://github.com/login/oauth/authorize"
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email"
    };
    const parameters = new URLSearchParams(config).toString();
    const finalURL = `${baseURL}?${parameters}`;
    return res.redirect(finalURL);
};

export const finishGithubLogin = async (req,res) => {
    const baseURL = "https://github.com/login/oauth/access_token"
    const config = {
        client_id:process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code
    };
    const parameters = new URLSearchParams(config).toString();
    const finalURL = `${baseURL}?${parameters}`;
    const tokenRequest = await(await fetch(finalURL, {
        method:"POST",
        headers:{
            Accept: "application/json"
        },
    })
    ).json();
    if("access_token" in tokenRequest) {
        //access api
        const {access_token} = tokenRequest;
        const apiURL = "https://api.github.com" ;
        const userData = await (await fetch(`${apiURL}/user`, {
            headers: {
                Authorization : `token ${access_token}`
            }
        })
        ).json();
        console.log(userData);
        const emailData = await (await fetch(`${apiURL}/user/emails`, {
            headers: {
                Authorization : `token ${access_token}`
            }})
        ).json();
        const emailObj = emailData.find(email => email.primary === true && email.verified === true);
        if(!emailObj) {
            return res.redirect("/");
        }
        let user = await User.findOne({email : emailObj.email});
        if (!user) {
            user = await User.create({
                avatarUrl: userData.avatar_url,
                name: userData.name,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                location: userData.location,
            });
        }
            req.session.loggedIn=true;
            req.session.user= user;
            return res.redirect("/home");
    } else {
        return res.redirect("/");
    }
};

export const logout = (req,res) => {
    req.session.destroy();
    return res.redirect("/");
};


export const startKakaoLogin = (req,res) => {
    const REST_API_KEY= process.env.REST_API_KEY
    const REDIRECT_URI="http://localhost:4000/users/kakao/finish"
    const baseURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}`
    return res.redirect(baseURL);
};

export const finishKakaoLogin = async(req,res) => {
    const baseURL = "https://kauth.kakao.com/oauth/token"
    const config = {
        grant_type:"authorization_code",
        client_id:"2615c3607ac526c2f3ce9fda979aeec9",
        redirect_uri:"http://localhost:4000/users/kakao/finish",
        code: req.query.code
    };
    const parameters = new URLSearchParams(config).toString();
    const finalURL = `${baseURL}?${parameters}`;
    const tokenRequest = await(await fetch(finalURL, {
        method:"POST",
        headers:{
            Accept: "application/json"
        },
    })).json();
    if("access_token" in tokenRequest) {
        //access api
        const {access_token} = tokenRequest;
        const apiURL = "https://kapi.kakao.com/v2/user/me" ;
        const userData = await (await fetch(`${apiURL}`, {
            headers: {
                Authorization : `Bearer ${access_token}`
            }
        })
        ).json();
        console.log(userData);
        let user = await User.findOne({email : userData.kakao_account.email});
        console.log(user);
        if (!user) {
            user = await User.create({
                email: userData.kakao_account.email,
                name: userData.kakao_account.profile.nickname,
                password: "",
                socialOnly: true,
                gender: userData.kakao_account.gender
            });
        }  
            req.session.loggedIn=true;
            req.session.user= user;
            return res.redirect("/home");
    }
    else {
        return res.redirect("/home");
    }
}

export const home = (req, res) => {
    return res.render("home",{pageTitle: "home"});
}
