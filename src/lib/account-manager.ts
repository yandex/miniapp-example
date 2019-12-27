export async function getCurrentUserInfo() {
    return {
        name: 'Аноним Анонимов',
        img: {
            src: {
                url: require('../assets/login-avatar.png'),
                width: 24,
                height: 24,
            },
            src2x: {
                url: require('../assets/login-avatar-2x.png'),
                width: 48,
                height: 48,
            },
        },
    };
}
