var express = require('express');
var router = express.Router();
const {
	MessengerClient
} = require('messaging-api-messenger');
const {
	MessengerBatch
} = require('messaging-api-messenger');
var config = require('config');
var cloudinary = require('cloudinary');
var objDb = require('../object/database.js');
// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ?
	process.env.MESSENGER_APP_SECRET :
	config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
	(process.env.MESSENGER_VALIDATION_TOKEN) :
	config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
//	(process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
///	config.get('pageAccessToken');
const IMAGE_CLOUD_NAME = process.env.image_cloud_name;
//(process.env.SERVER_URL) :
//config.get('image_cloud_name');
const IMAGE_API_KEY = process.env.image_api_key;
////(process.env.SERVER_URL) :
//config.get('image_api_key');
const IMAGE_API_SECRET = process.env.image_api_secret;
//(process.env.SERVER_URL) :
//	config.get('image_api_secret');
cloudinary.config({
	cloud_name: IMAGE_CLOUD_NAME,
	api_key: IMAGE_API_KEY,
	api_secret: IMAGE_API_SECRET
});
//const client = MessengerClient.connect();
const client = MessengerClient.connect({
	accessToken: PAGE_ACCESS_TOKEN,
	version: '3.1',
});
const SERVER_URL = process.env.SERVER_URL;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/facebook', function (req, res, next) {

	console.log("get facebook")
	if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VALIDATION_TOKEN) {
		console.log("Validating webhook facebook : ", req.query['first_name']);
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.log("Không xác nhận. Đảm bảo rằng token hợp lệ phù hợp.");
		res.sendStatus(403);
	}

});
router.post('/facebook', function(req, res, next) {
 
	var data = req.body;
	console.log("Res Post facebook");

	// Checks this is an event from a page subscription
	if (data.object === 'page') {

		// Iterates over each entry - there may be multiple if batched
		data.entry.forEach(function (pageEntry) {
			var pageID = pageEntry.id;
			var timeOfEvent = pageEntry.time;
			if (pageEntry.messaging) {
				pageEntry.messaging.forEach(function (messagingEvent) {
					var senderID = messagingEvent.sender.id;
					//console.log("face event", messagingEvent.postback.payload);
					if (messagingEvent.message) {
						//console.log("Res Post facebook 1");
						receivedMessage(messagingEvent);


					} else if (messagingEvent.delivery) {
						console.log("Res Post delivery");
						////receivedDeliveryConfirmation(messagingEvent);
					} else if (messagingEvent.postback && messagingEvent.postback.payload == 'getstarted') {
						//present user with some greeting or call to action
						client.sendMessage(senderID, 'Xin chào, mình là trợ lý ảo của Hành trình Thanh niên Khởi nghiệp Đổi mới Sáng tạo của Hội LHTN Việt Nam! Mình sẽ mang đến cho bạn một cơ hội vừa được trang bị kiến thức và kinh nghiệm khởi nghiệp, vừa được đi du lịch miễn phí đấy, hãy cùng khám phá bước tiếp theo nhé:').then(()=>{
							client.sendTemplate(senderID,{
								template_type: 'button',
								text: '',
								buttons: [{
									type: 'postback',
									title: 'Đăng ký ngay',
									payload: 'start1',
								},{
									type: 'postback',
									title: 'Tìm hiểu thông tin',
									payload; 'start2'
								} ],

							})
						});
					} else if (messagingEvent.postback && messagingEvent.postback.payload == 'confirm') {
						//present user 'confirm':				
						//sendMessageConfimRegister(messagingEvent.sender.id);

					} else {
						console.log("Facebook Webhook received unknown messagingEvent: ", messagingEvent);
					}
					////// Cập nhật lại thời gian hết hạn của member để đếm số thành viên đang hoạt động với bót
				

				});
			} else {
				console.log("Messaging undefined");
			}

		});

		// Returns a '200 OK' response to all requests
		res.status(200).send('EVENT_RECEIVED');
	} else {
		// Returns a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}
	
	
});
router.get('/setup', function (req, res, next) {

	client.setGreeting([{
		locale: 'default',
		text: 'Xin chào bạn đã đến với Hành Trình Thanh Niên Khởi Nghiệp ĐMST. Hãy chọn Bắt đầu để tham gia chương trình.',
	}, ]);
	////client.setGetStarted('getstarted');

});
router.get('/setup2', function (req, res, next) {

	
	client.setGetStarted('getstarted');

});
function receivedMessage(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;
	let response;
	console.log("Received message for user %d and page %d at %d with message:",
		senderID, recipientID, timeOfMessage);
	console.log(JSON.stringify(message));
	var isEcho = message.is_echo;
	var messageId = message.mid;
	var appId = message.app_id;
	var metadata = message.metadata;
	// You may get a text or attachment but not both
	var messageText = message.text;
	var messageAttachments = message.attachments;
	var quickReply = message.quick_reply;
	var msg = "x";

	if (isEcho) {
		// Just logging message echoes to console
		console.log("Received echo for message %s and app %d with metadata %s",
			messageId, appId, metadata);
		return;
	} else if (quickReply) {
		
		client.sendText(senderID, 'Hello! quickReply', { tag: 'ISSUE_RESOLUTION' });
	
	}else if (messageText) {
		switch (messageText.toLowerCase()) {
			case 'giá xe':
				client.sendMessage(senderID, {  text: 'Hanoi (KV1) -> Noibai: 200k,Noibai -> Hanoi (KV1): 250k',});
				client.sendAttachment(senderID, {
				  type: 'image',
				  payload: {
					url: 'https://scontent.fhan3-2.fna.fbcdn.net/v/t1.0-9/31081528_568961726811775_3035050846015455232_n.jpg?_nc_cat=0&oh=275c0f15fc0d56e03fee30afc9bea818&oe=5C060612',
				  },
				});
				break;
			case 'liên hệ':
				client.sendMessage(senderID, {  text: 'MKmart hotline: 091.128.5465 / 1900545465!',});
				break;
			default:
			client.sendText(senderID, 'Hello! messageText', { tag: 'ISSUE_RESOLUTION' });
			break;
		
		}

	}
};
module.exports = router;
