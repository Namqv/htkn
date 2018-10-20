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
						client.sendTemplate(senderID,{
							template_type: 'button',
							text: 'Xin chào, mình là trợ lý ảo của Hành trình Thanh niên Khởi nghiệp Đổi mới Sáng tạo của Hội LHTN Việt Nam! Mình sẽ mang đến cho bạn một cơ hội vừa được trang bị kiến thức và kinh nghiệm khởi nghiệp, vừa được đi du lịch miễn phí đấy, hãy cùng khám phá bước tiếp theo nhé:',
							buttons: [{
								type: 'postback',
								title: 'Đăng ký ngay',
								payload: 'DKY',
							},{
								type: 'postback',
								title: 'Tìm hiểu thông tin',
								payload: 'THTT',
							} ],

						});
					} else if (messagingEvent.postback && messagingEvent.postback.payload == 'THTT') {
						client.sendTemplate(senderID,{
							template_type: 'button',
							text: 'Nếu bạn là người đang có ý tưởng, dự án khởi nghiệp thì đây chính là cuộc hành trình dành cho bạn. Hãy cùng khám phá những điều Hành trình có thể mang lại cho bạn nhé!',
							buttons: [{
								type: 'postback',
								title: 'Thông tin hành trình',
								payload: 'TTHT',
							},],

						},{
							quick_replies: [{
								content_type: 'text',
								title: 'Nhà đầu tư',
								payload: 'NDT',
								///image_url: SERVER_URL + "/images/miss.png"
							}, {
								content_type: 'text',
								title: 'Chuyên gia cố vấn',
								payload: 'CGCV',
								//	image_url: SERVER_URL + "/images/audience.png"
							},{
								content_type: 'text',
								title: 'Đi thực tế',
								payload: 'DTT',
							},{
								content_type: 'text',
								title: 'Gặp lãnh đạo',
								payload: 'GLD',
							},{
								content_type: 'text',
								title: 'Quảng bá sản phẩm',
								payload: 'QBSP',
							},{
								content_type: 'text',
								title: 'Xem thêm',
								payload: 'XT',
							}],

						});

					}else if (messagingEvent.postback && messagingEvent.postback.payload == 'TTHT'){
						client.sendImage(senderID,SERVER_URL + "images/mota.png").then(() => {
							client.sendText(senderID,'Hành trình quy tụ 100 bạn trẻ/nhóm khởi nghiệp với những ý tưởng sáng tạo xuất sắc nhất sẽ cùng tham gia các hoạt động, sự kiện thực tiễn đầy thú vị, bổ ích. Cùng khám phá các game thực tế của Hành trình ngay nào! ',{
								quick_replies: [{
								content_type: 'text',
								title: 'Cùng khởi nghiệp',
								payload: 'CKN',
								///image_url: SERVER_URL + "/images/miss.png"
							}, {
								content_type: 'text',
								title: 'Doanh nhân thành đạt',
								payload: 'DNTD',
								//	image_url: SERVER_URL + "/images/audience.png"
							},{
								content_type: 'text',
								title: 'Sàn GD ý tưởng',
								payload: 'SGDYT',
							}],

							});
						});
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
		switch (quickReply.toLowerCase()) {
			case 'nhà đầu tư':
				client.sendText(senderID,'Bạn có cơ hội được gặp gỡ các nhà đầu tư, tiếp cận quỹ đầu tư qua các buổi hội thảo, các sự kiện giao lưu, tọa đàm tại các địa phương, các hoạt động thực tế diễn ra trong suốt Hành trình.',{
							quick_replies: [{
								content_type: 'text',
								title: 'Tìm hiểu thêm',
								payload: 'THT',
								///image_url: SERVER_URL + "/images/miss.png"
							}]
						});
				break;
			case 'chuyên gia cố vấn':
				client.sendText(senderID,'Các chuyên gia cố vấn từ các tập đoàn, doanh nghiệp, các startup tiêu biểu trong mọi lĩnh vực sẽ tư vấn, hỗ trợ, chia sẻ kinh nghiệm làm startup, các phương diện quản lý, kinh doanh thương mại,... từ những thành công và thất bại của họ.').then(() => {
							client.sendText(senderID,'Thật đáng mong đợi phải không nào :d . Ban tổ chức sẽ sớm bật mí "Họ là ai ?" nhé!',{
								quick_replies: [{
									content_type: 'text',
									title: 'Tìm hiểu thêm',
									payload: 'THT',
									///image_url: SERVER_URL + "/images/miss.png"
								}]
							});
						});
				break;
			case 'đi thực tế':
				client.sendText(senderID,'Cùng với các chương trình "giao lưu, tọa đàm, hội thảo tại địa phương" bạn sẽ được mắt thấy, tai nghe, được trải nghiệm thực tế tại các mô hình startup tiêu biểu, các tập đoàn, doanh nghiệp lớn tại 11 điểm dừng trong Hành trình.').then(() => {
							client.sendText(senderID,'Bạn sẽ hiểu rõ hơn về quy trình sản xuất/ canh tác, cơ cấu tổ chức sản xuất/ nhân sự, quản trị các nguồn lực, các tiêu chuẩn, quy chuẩn sản phẩm,… trong các lĩnh vực khác nhau như nông nghiệp, công nghiệp, xây dựng, dịch vụ, công nghệ, du lịch, y tế,…',{
								quick_replies: [{
									content_type: 'text',
									title: 'Tìm hiểu thêm',
									payload: 'THT',
									///image_url: SERVER_URL + "/images/miss.png"
								}]
							});
						});
				break;
			case 'gặp lãnh đạo':
				client.sendText(senderID,'Mỗi điểm dừng chân trong Hành trình, bạn sẽ được gặp các lãnh đạo tỉnh/ thành phố, có cơ hội mở rộng mối quan hệ hợp tác, hiểu rõ hơn về các chính sách tại địa phương, là bước đệm trong phát triển, mở rộng dự án trong tương lai',{
							quick_replies: [{
								content_type: 'text',
								title: 'Tìm hiểu thêm',
								payload: 'THT',
								///image_url: SERVER_URL + "/images/miss.png"
							}]
						});
				break;
			case 'quảng bá sản phẩm':
				client.sendText(senderID,'Với "Sàn giao dịch ý tưởng" và "Hội chợ các sản phẩm khởi nghiệp đổi mới sáng tạo" video về ý tưởng của bạn sẽ được trình chiếu trong các hoạt động tại 11 địa điểm của Hành trình, trên các kênh của BTC, các sản phẩm khởi nghiệp sẽ được trưng bày trong hội chợ - nơi gặp gỡ giao lưu của các ý tưởng sáng tạo tuyệt vời.').then(() => {
							client.sendText(senderID,'Có thể mở rộng mối quan hệ, gặp những bạn trẻ cùng chí hướng, được quảng bá sản phẩm trên các phương tiện thông tin đại chúng hoàn toàn miễn phí. Bạn sẽ không bỏ lỡ cơ hội tuyệt vời này, phải không nào ',{
								quick_replies: [{
									content_type: 'text',
									title: 'Tìm hiểu thêm',
									payload: 'THT',
									///image_url: SERVER_URL + "/images/miss.png"
								}]
							});
						});
				break;
			case 'xem thêm':
				client.sendText(senderID,'Tham gia "Diễn đàn Thanh niên khởi nghiệp đổi mới sáng tạo trong kỷ nguyên 4.0” bạn được đưa ra kiến nghị, đề xuất các cơ chế, chính sách với chính phủ, được hiểu rõ hơn về các chính sách của Đảng và Nhà nước đối với vấn đề khởi nghiệp đổi mới sáng tạo của các của doanh nghiệp khởi nghiệp và các nhà đầu tư, các nhà tư vấn…',{
							quick_replies: [{
								content_type: 'text',
								title: 'Tìm hiểu thêm',
								payload: 'THT',
								///image_url: SERVER_URL + "/images/miss.png"
							}]
						});
				break;
			case 'cùng khởi nghiệp':
				client.sendText(senderID,'Với game "Cùng nhau khởi nghiệp", 100 thành viên được chia thành 10 đội, dưới sự hỗ trợ và tư vấn của các chuyên gia cố vấn sẽ cùng nhau lập kế hoạch, đưa ra phương án kinh doanh để cùng thực hiện trong suốt Hành trình').then(() => {
							client.sendText(senderID,' Ngày 28/11/2018, tại điểm cuối của Hành trình (Đà Nẵng) các đội sẽ giới thiệu và bảo vệ dự án. Hội đồng giám khảo và các Nhà đầu tư sẽ lựa chọn 3 dự án xuất sắc nhất để trao giải thưởng và vinh danh. ',{
								quick_replies: [{
									content_type: 'text',
									title: 'Tìm hiểu thêm',
									payload: 'THT',
									///image_url: SERVER_URL + "/images/miss.png"
								}]
							});
						});
				break;
			case 'doanh nhân thành đạt':
				client.sendText(senderID,'Với game "Trải nghiệm một ngày làm Doanh nhân", các chuyên gia sẽ đào tạo kỹ năng, hướng dẫn và tư vấn cho các doanh nhân tập sự từ tác phong đi lại, ăn uống, giao tiếp, trang phục … những phong thái của một doanh nhân thành đạt.',{
							quick_replies: [{
								content_type: 'text',
								title: 'Tìm hiểu thêm',
								payload: 'THT',
								///image_url: SERVER_URL + "/images/miss.png"
							}]
						});
				break;
			case 'sàn gd ý tưởng':
				client.sendText(senderID,'Với game "Sàn giao dịch ý tưởng", mỗi bạn sẽ quay video trình bày về ý tưởng của mình (dài khoảng 3 phút) và được  trình chiếu trong các hoạt động tại 11 tỉnh/ thành phố Hành trình đi qua và trên các kênh của Ban Tổ chức.').then(() => {
							client.sendText(senderID,'  Đây sẽ là một cơ hội tuyệt vời cho bạn trau chuốt ý tưởng, quảng bá, phát triển dự án và kêu gọi đầu tư phải không nào .',{
								quick_replies: [{
									content_type: 'text',
									title: 'Tìm hiểu thêm',
									payload: 'THT',
									///image_url: SERVER_URL + "/images/miss.png"
								}]
							});
						});
				break;
			case 'tìm hiểu thêm':
				client.sendTemplate(senderID,{
							template_type: 'button',
							text: 'Xin chào, mình là trợ lý ảo của Hành trình Thanh niên Khởi nghiệp Đổi mới Sáng tạo của Hội LHTN Việt Nam! Mình sẽ mang đến cho bạn một cơ hội vừa được trang bị kiến thức và kinh nghiệm khởi nghiệp, vừa được đi du lịch miễn phí đấy, hãy cùng khám phá bước tiếp theo nhé:',
							buttons: [{
								type: 'postback',
								title: 'Đăng ký ngay',
								payload: 'DKY',
							},{
								type: 'postback',
								title: 'Tìm hiểu thông tin',
								payload: 'THTT',
							} ],

						});
				break;
			default:
			client.sendText(senderID, 'Hello! messageText', { tag: 'ISSUE_RESOLUTION' });
			break;
		
		}

	}
};
module.exports = router;
