// Error handling middleware

export default (err, req, res, next) => {
    // Error list
    const errorList = [
        { status: 304, type: 'Not Modified' },
        { status: 400, type: 'Bad Request' },
        { status: 401, type: 'Unauthorized' },
        { status: 403, type: 'Forbidden' },
        { status: 404, type: 'Not Found' },
        { status: 409, type: 'Conflict' },
        { status: 500, type: 'Internal Server Error' },
        { status: 502, type: 'Bad Gateway' },
        { status: 504, type: 'Gateway Timeout' },
    ];

    const error = errorList.find(e => e.status === err.code);
    if (error) {
        // console.log(err)
        res.status( error.status ).send({ error: {
            status: error.status,
            type: error.type,
            message: err.message,
            data: err.data,
        }});
        return;
    }
    else if (err) {
        // console.log(err)
        res.status(500).send({ error: {
            status: 500,
            type: 'Internal Server Error',
            message: 'An unexpected error occurred',
            data: err.message || err,
        }});
        return;
    }

    next();
}
