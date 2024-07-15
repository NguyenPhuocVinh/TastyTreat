export function randomAccount () {
    const randomString = Math.random().toString(36).substring(2, 15);
    const randomPassword = Math.random().toString(36).substring(2, 15);
    const domain = "guest.com";    
    const emailRandom = randomString + "@" + domain;
    return {
        email: emailRandom,
        password: randomPassword,
    }
}