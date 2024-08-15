export default fixedVars => (req, res, next) => {
    res.templateRender = async (view, templateVars = {}) => {
        // set fixed variables
        templateVars = {
            ...fixedVars,
            ...templateVars,
        };

        // eliminate undefined values
        for (let key in templateVars) {
            if (!templateVars[key]) {
                delete templateVars[key];
            }
        }

        const vars = {
            // send the templateVars to a hidden input in the template. Frontend will read this and store it in a class
            'template-vars': new URLSearchParams(templateVars).toString(),
            // send the templateVars to replace the view
            ...templateVars,
        };
        // console.log(vars)
        res.render(view, vars);
    }
    next();
};