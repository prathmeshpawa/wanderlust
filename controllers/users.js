const User = require("../models/user");

// ================= SIGNUP FORM =================
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

// ================= SIGNUP =================
module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // ✅ Basic validation (prevents crash if empty form)
        if (!username || !email || !password) {
            req.flash("error", "All fields are required!");
            return res.redirect("/signup");
        }

        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        // ✅ Auto login after signup
        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to Wonderlust!");
            return res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        return res.redirect("/signup");
    }
};

// ================= LOGIN FORM =================
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

// ================= LOGIN =================
module.exports.login = (req, res) => {
    req.flash("success", "Welcome back to Wonderlust!");

    const redirectUrl = req.session.redirectUrl || "/listings";
    delete req.session.redirectUrl;

    return res.redirect(redirectUrl);
};

// ================= LOGOUT =================
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        // ✅ destroy session completely (better practice)
        req.session.destroy(() => {
            req.flash("success", "Logged you out!");
            return res.redirect("/listings");
        });
    });
};