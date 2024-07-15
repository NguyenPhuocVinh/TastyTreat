import app from "./app.js";
import connectMongose from "./helpers/connect.mongose.js";

const start = async () => {
    try {
        connectMongose();
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
}

start();