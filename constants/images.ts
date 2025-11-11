// apparently dynamic require() is not supported in react native
// thsi is the only way :((
type imageType = {
    [key: string]: string;
};

const images: imageType = {
    "Feelings and Behaviours": require("@/assets/images/Youre_Not_Alone.jpg"),
    "Greetings and Checking In": require("@/assets/images/map-of-australia-painting-in-the-aboriginal-style-vector-1035812.jpg"),
};

export default images;
