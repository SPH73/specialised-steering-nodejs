function handleServerError(error, req, res, next) {
    console.log(error);
    res.status(500).render('500');
}

function handleNotFoundError(error, req, res, next) {
    console.log(error);
    res.status(404).render('404');
}

module.exports = {
    handleServerError: handleServerError,
    handleNotFoundError: handleNotFoundError,
};
