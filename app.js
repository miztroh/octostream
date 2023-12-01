import express from 'express';
import { default as MjpegProxy } from 'node-mjpeg-proxy';

const app = express();
app.listen(3000);

if (!process.env.OCTOSTREAM_URL) throw 'Invalid OCTOSTREAM_URL!';
if (!process.env.OCTOSTREAM_API_KEY) throw 'Invalid OCTOSTREAM_API_KEY!';

let state = null;

const updateState = async () => {
	try {
		const printer = await (
			await fetch(
				`${process.env.OCTOSTREAM_URL}/api/printer`,
				{
					method: 'GET',
					headers: {
						'X-Api-Key': process.env.OCTOSTREAM_API_KEY
					}
				}
			)
		).json();
	
		const job = await (
			await fetch(
				`${process.env.OCTOSTREAM_URL}/api/job`,
				{
					method: 'GET',
					headers: {
						'X-Api-Key': process.env.OCTOSTREAM_API_KEY
					}
				}
			)
		).json();
	
		state = {
			printer,
			job
		};
	} catch {
		state = null;
	}
};

updateState();
setInterval(updateState, 5000);

let proxy = null;

app.get(
	'/stream.jpg',
	(req, res) => {
		if (!state || !state.printer || state.printer.error) {
			if (proxy) {
				proxy.globalMjpegResponse.destroy();
				proxy = null;
			}

			res.status(404).send('Offline');
		} else {
			if (!proxy) proxy = new MjpegProxy(`${process.env.OCTOSTREAM_URL}/webcam/?action=stream`);
			proxy.proxyRequest(req, res);
		}
	}
);

app.get(
	'/api/state',
	async (req, res) => {
		res.json(state);
	}
);

app.use(express.static('public'));