const axios = require('axios');
const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
    const { character } = req.query;

    // 启动浏览器
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try {
        // 访问百度汉语
        await page.goto('https://hanyu.baidu.com/');
        await page.type('#kw', character); // 输入汉字
        await page.click('#su'); // 点击搜索
        await page.waitForSelector('img[src$=".gif"]'); // 等待GIF加载

        // 获取GIF的URL
        const gifUrl = await page.evaluate(() => {
            const img = document.querySelector('img[src$=".gif"]');
            return img ? img.src : null;
        });

        if (gifUrl) {
            // 使用axios下载GIF
            const response = await axios.get(gifUrl, { responseType: 'arraybuffer' });
            res.setHeader('Content-Type', 'image/gif');
            res.send(response.data); // 发送GIF数据
        } else {
            res.status(404).send('GIF not found');
        }
    } catch (error) {
        console.error('Error downloading GIF:', error);
        res.status(500).send('Error downloading GIF');
    } finally {
        await browser.close();
    }
};
