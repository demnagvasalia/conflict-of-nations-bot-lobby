export function randomText(len) {
    const chars = [
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p",
        "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F",
        "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V",
        "W", "X", "Y", "Z"
    ];

    let result = "";
    for (let i = 0; i < len; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
}

export function getRandomFile(files) {
    const randomIndex = Math.floor(Math.random() * files.length);
    return files[randomIndex];
}

export function getRandomCredentialsFile() {
    return `credentials.txt`;
}