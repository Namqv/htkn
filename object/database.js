/////Search engine functions create new, update, delete data in mongoDb
MongoClient = require('mongodb').MongoClient;
mongodb = require('mongodb');
config = require('config');

MONGO_URL = (process.env.MESSENGER_APP_SECRET) ?
	process.env.MESSENGER_APP_SECRET :
	config.get('mongoUrl');
DATA_BASE_NAME = (process.env.MESSENGER_APP_SECRET) ?
	process.env.MESSENGER_APP_SECRET :
	config.get('databasename');
SERVER_URL = (process.env.SERVER_URL) ?
	(process.env.SERVER_URL) :
	config.get('serverURL');



var dbQueryCounter = 0;
var maxDbIdleTime = 5000;
module.exports = {
	getConnection: function (callback) {

		MongoClient.connect(MONGO_URL, function (err, client) { //conn =client;
			//console.log("Create:",client);
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
			} else {
				//console.log("Create conn 2:");
				callback(client);
			}
		});

	},
	/// Lấy danh sách tinh thành và thành phố cấp 1
	findSupport: function (query, client, callback) {
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Support');
		// Find some documents
		collection.find(query).toArray(function (err, results) {

			if (err) {

				console.log("err:", err);
			} else {

				callback(results);
			}
		});
	},
	findMembersTop: function (query, top, client, callback) {
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		collection = db.collection('MembersGame');
		// Find some documents
		collection.find(query).sort({
			"TotailShareActive": -1
		}).limit(top).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				callback(err);
			} else {
				callback(results);
			}
		});
	},
	findMembers: function (query, client, callback) {
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		collection = db.collection('Members');
		// Find some documents
		collection.find(query).sort({
			"_id": 1
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				callback(err);
			} else {
				callback(results);
			}
		});
	},
	findMembersGame: function (query, client, callback) {
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		collection = db.collection('MembersGame');
		// Find some documents
		collection.find(query).sort({
			"TotailShareActive": -1
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				callback(err);
			} else {
				callback(results);
			}
		});
	},

	findMembersGame2: function (query, client, callback) {
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		collection = db.collection('MembersGame_2');
		// Find some documents
		collection.find(query).sort({
			"ShareActive": -1
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				callback(err);
			} else {
				callback(results);
			}
		});
	},
	findFeature: function (query, client, callback) {
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		collection = db.collection('Feature');
		// Find some documents
		collection.find(query).sort({
			"_id": -1
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				callback(err);
			} else {
				callback(results);
			}
		});
	},
	findSumRedeemGifts: function (client, callback) {
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		collection = db.collection('RedeemGifts');
		// Find some documents
		collection.aggregate([{
			"$group": {
				"_id": null,
				"Value": {
					"$sum": "$Value"
				}
			}
		}]).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				callback(err);
			} else {
				callback(results);
			}
		});
	},
	findTotalMGame: function (client, callback) {
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);

		collection = db.collection('MembersGame');
		// Find some documents
		collection.aggregate([{
			"$match": {
				"_id": {
					"$ne": null
				}
			}
		}, {
			"$group": {
				"_id": null,
				"Total": {
					"$sum": 1
				}
			}
		}]).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				callback(err);
			} else {
				callback(results);
			}
		});
	},
	insertMembers: function (objMembers, client, callback) {

		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Members');
		//var objCallback = null;
		collection.find({
			'_id': objMembers._id
		}).toArray(function (err, results) {
			if (err) {
				console.log("err:", err);
			} else {
				//console.log('Kiểm tra xem tồn tại hay chưa:', results.length);
				if (results.length == 0) {
					console.log('add :', objMembers._id);
					// insert Users
					collection.insertOne(objMembers, function (err, res) {
						//neu xay ra loi
						if (err) throw err;
						//neu khong co loi			
						console.log('add ss :', objMembers._id);
						callback(null, 'SUCCESS');
					});

				} else {
					//đã tồn tại
					//console.log('Tai khoan da ton tai');
					callback('ERROR_EXIST');
				}
			}
		});
	},

	insertSetPendingCandidatesName: function (objCandidates, client, callback) {
		var mydate = new Date();
		var inputDate = new Date(mydate.toISOString());
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Members');
		//var objCallback = null;
		collection.find({
			'_id': objCandidates._id
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				//callback(err);
			} else {
				//console.log('Kiểm tra xem tồn tại hay chưa:', results.length);
				if (results.length == 0) {
					// insert documents
					//this.getNextSequenceValue('CandidatesCode',client, function(er,rs){
					//objCandidates.CandidatesCode=rs.sequence_value;
					collection.insertOne(objCandidates, function (err, res) {
						//neu xay ra loi
						if (err) throw err;
						//neu khong co loi			
						console.log('insertSetPendingCandidatesName:', objCandidates);
						callback(null, res);
						///});
					});
				} else {
					//console.log('Thành viên đã điểm danh');
					var objCandidatesUpdate = {
						$set: {

							"BlockStatus": "PENDING_NAME",
							"Type": "Candidates",
							"UpdateDate": inputDate
						}
					};
					collection.updateOne({
						'_id': objCandidates._id
					}, objCandidatesUpdate, function (err, res) {
						//neu xay ra loi
						if (err) throw err;
						//neu khong co loi			
						//console.log('Them thanh cong :',objMember);
						console.log("Update insertSetPendingCandidatesName:", objCandidatesUpdate);
						callback(null, res);
					});
					//callback(null, res);

				}

			}
		});

	},
	insertCandidatesName: function (objCandidates, client, callback) {
		var mydate = new Date();
		var inputDate = new Date(mydate.toISOString());
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Members');
		//var objCallback = null;
		collection.find({
			'_id': objCandidates._id
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				//callback(err);
			} else {
				//console.log('Kiểm tra xem tồn tại hay chưa:', results.length);
				if (results.length == 0) {
					// insert documents
					collection.insertOne(objCandidates, function (err, res) {
						//neu xay ra loi
						if (err) throw err;
						//neu khong co loi			
						//console.log('Them thanh cong :',objMember);
						callback(null, res);
					});

				} else {
					//console.log('Thành viên đã điểm danh');
					var objCandidatesUpdate = {
						$set: {
							"Name": objCandidates.Name,
							"BlockStatus": "ACTIVE_NAME",
							"Type": "Candidates",
							"UpdateDate": inputDate
						}
					};
					collection.updateOne({
						'_id': objCandidates._id
					}, objCandidatesUpdate, function (err, res) {
						//neu xay ra loi
						if (err) throw err;
						//neu khong co loi			
						//console.log('Them thanh cong :',objMember);
						console.log("Update:", objCandidatesUpdate);
						callback(null, res);
					});
					//callback(null, res);

				}

			}
		});

	},
	insertCandidatesPic: function (id, objCandidates, client, callback) {
		var mydate = new Date();
		var inputDate = new Date(mydate.toISOString());
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Members');
		//var objCallback = null;
		collection.find({
			'_id': id
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				//callback(err);
			} else {
				//console.log('Kiểm tra xem tồn tại hay chưa:', results.length);
				if (results.length == 0) {
					// insert documents
					collection.insertOne(objCandidates, function (err, res) {
						//neu xay ra loi
						if (err) throw err;
						//neu khong co loi			
						//console.log('Them thanh cong :',objMember);
						callback(null, res);
					});

				} else {
					//console.log('Thành viên đã điểm danh');
					//	objCandidates.UpdateDate=inputDate;
					collection.updateOne({
						'_id': id
					}, objCandidates, function (err, res) {
						//neu xay ra loi
						if (err) throw err;
						//neu khong co loi			
						//console.log('Them thanh cong :',objMember);
						console.log("Update insertCandidatesPic:", objCandidates);
						callback(null, res);
					});
					//callback(null, res);

				}

			}
		});

	},
	setCandidatesStatus: function (id, status, client, callback) {
		var mydate = new Date();
		var inputDate = new Date(mydate.toISOString());
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Members');
		var objMemberUpdate = {
			$set: {
				"BlockStatus": status,
				"UpdateDate": inputDate
			}
		};
		collection.updateOne({
			'_id': id
		}, objMemberUpdate, function (err, res) {
			//neu xay ra loi
			if (err) throw err;

			callback(err, res);
		});
	},
	insertFeature: function (objFeature, client, callback) {

		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Feature');
		//var objCallback = null;
		collection.find({
			'_id': objFeature._id
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				//callback(err);
			} else {
				//console.log('Kiểm tra xem tồn tại hay chưa:', results.length);
				if (results.length == 0) {
					// insert documents
					collection.insertOne(objFeature, function (err, res) {
						//neu xay ra loi
						if (err) throw err;
						//neu khong co loi
						console.log('insertFeature SS :', objFeature);
						collection.findAndModify({
								_id: objFeature.ShareID
							}, [], {
								$inc: {
									ShareActive: 1
								}
							}, {
								upsert: true,
								new: true
							},
							function (err, doc) {
								console.log("Update ShareActive ID" + objFeature.ShareID + " Value: ", doc.value);
								if (err) throw err;
								callback(doc, res);
							}
						);

						//callback(null, res);
					});

				} else {
					console.log('insertFeature Member is active : ', objFeature._id);
					callback(null, null);
				}

			}
		});

	},
	insertRedeemGifts: function (objRedeemGifts, client, callback) {

		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('RedeemGifts');
		const collection2 = db.collection('MembersGame');

		collection.insertOne(objRedeemGifts, function (err, res) {
			//neu xay ra loi
			if (err) throw err;
			//neu khong co loi
			console.log('insertRedeemGifts SS :', objRedeemGifts);
			collection2.findAndModify({
					_id: objRedeemGifts.ShareID
				}, [], {
					$inc: {
						ShareActive: 3,
						TotailShareActive: 3
					}
				}, {
					upsert: true,
					new: true
				},
				function (err, doc) {
					console.log("Update ShareActive ID" + objRedeemGifts.ShareID + " Value: ", doc.value);
					if (err) throw err;
					collection2.findAndModify({
							_id: objRedeemGifts.SenderID
						}, [], {
							$inc: {
								ShareActive: -objRedeemGifts.PointValue
							}
						}, {
							upsert: true,
							new: true
						},
						function (err, doc) {
							console.log("Update Member ID" + objRedeemGifts.SenderID + " Value: ", doc.value);
							if (err) throw err;
							callback(doc, res);
						}
					);
				}
			);
		});
	},
	insertMembersGamePoint: function (objMembersGame, point, client, callback) {

		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('MembersGame');
		//var objCallback = null;
		collection.find({
			'_id': objMembersGame._id
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				//callback(err);
			} else {
				//console.log('Kiểm tra xem tồn tại hay chưa:', results.length);
				if (results.length == 0) {
					// insert documents
					collection.insertOne(objMembersGame, function (err, res) {
						//neu xay ra loi
						if (err) throw err;
						//neu khong co loi
						console.log('insertMembersGame SS :', objMembersGame);
						//						collection.findAndModify({
						//								_id: objMembersGame.ShareID
						//							}, [], {
						//								$inc: {
						//									ShareActive: point,
						//									TotailShareActive: point
						//								}
						//							}, {
						//								upsert: true,
						//								new: true
						//							},
						//							function (err, doc) {
						//								console.log("Update ShareActive ID" + objMembersGame.ShareID + " Value: ", doc.value);
						//								if (err) throw err;
						//								callback(doc, res);
						//							}
						//						);

						callback(null, res);
					});

				} else {
					console.log('insertMembersGame Member is active : ', objMembersGame._id);
					callback(null, null);
				}

			}
		});

	},

	insertMembersPoint: function (psid, point, client, callback) {

		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('MembersGame');
		//var objCallback = null;
		collection.find({
			'_id': psid,
			'Status': 'P'
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				//callback(err);
			} else {
				//console.log('Kiểm tra xem tồn tại hay chưa:', results.length);
				if (results.length > 0) {
					// insert documents
					var objMembersGame = results[0];
				
					var objMemberUpdate = {
						$set: {
							"Status": 'A'
						}
					};
					collection.updateOne({
						'_id': psid
					}, objMemberUpdate, function (err, res) {
						if (err) throw err;
						collection.findAndModify({
								_id: objMembersGame.ShareID
							}, [], {
								$inc: {
									ShareActive: point,
									TotailShareActive: point
								}
							}, {
								upsert: true,
								new: true
							},
							function (err, doc) {
								console.log("Update ShareActive ID" + objMembersGame.ShareID + " Value: ", doc.value);
								if (err) throw err;
								callback(doc, results[0]);
							}
						);


					});

				} else {
					console.log('insertMembersGame Member not active : ', psid);
					callback(null, null);
				}

			}
		});

	},
	insertMembersGame: function (objMembersGame, client, callback) {

		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('MembersGame');
		//var objCallback = null;
		collection.find({
			'_id': objMembersGame._id
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				//callback(err);
			} else {
				//console.log('Kiểm tra xem tồn tại hay chưa:', results.length);
				if (results.length == 0) {
					// insert documents
					collection.insertOne(objMembersGame, function (err, res) {
						//neu xay ra loi
						if (err) throw err;
						//neu khong co loi
						console.log('insertMembersGame SS :', objMembersGame);
						collection.findAndModify({
								_id: objMembersGame.ShareID
							}, [], {
								$inc: {
									ShareActive: 1
								}
							}, {
								upsert: true,
								new: true
							},
							function (err, doc) {
								console.log("Update ShareActive ID" + objMembersGame.ShareID + " Value: ", doc.value);
								if (err) throw err;
								callback(doc, res);
							}
						);

						//callback(null, res);
					});

				} else {
					console.log('insertMembersGame Member is active : ', objMembersGame._id);
					callback(null, null);
				}

			}
		});

	},
	updateBlockMembersGame: function (psid, block, client, callback) {
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('MembersGame');
		var objMemberUpdate = {
			$set: {
				"Block": block
			}
		};
		collection.updateOne({
			'_id': psid
		}, objMemberUpdate, function (err, res) {
			//neu xay ra loi
			if (err) throw err;
			//console.log("Update status Kyc Member:", err);
			callback(null, res);
		});
	},
	updateShareActiveGame: function (psid, point, client, callback) {
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('MembersGame');
		var objMemberUpdate = {
			$set: {
				"ShareActive": point
			}
		};
		collection.updateOne({
			'_id': psid
		}, objMemberUpdate, function (err, res) {
			//neu xay ra loi
			if (err) throw err;
			//console.log("Update status Kyc Member:", err);
			callback(null, res);
		});
	},
	updateFeature: function (psid, ask, client, callback) {
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Feature');
		var objMemberUpdate = {
			$set: {
				"Ask": ask
			}
		};
		collection.updateOne({
			'_id': psid
		}, objMemberUpdate, function (err, res) {
			//neu xay ra loi
			if (err) throw err;
			//console.log("Update status Kyc Member:", err);
			callback(null, res);
		});
	},

	updateNthMemeber: function (psid, ask,ans ,client, callback) {
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Members');
		var name='Nth.'+ask;
		var str = 'Nth.${ask}';
		//var Nth={};
		var obj={};
		//obj[ask]=ans;
		//Nth['Nth']
		var update = {};
		update["Nth."+ask] = ans;
	
	    var objMemberUpdate = {
			$set:update
		};
		console.log(objMemberUpdate);
//		collection.findAndModify({
//			_id: psid
//			}, [],{
//			
//			}, {
//				upsert: true,
//				new: true
//			},
//			function (err, doc) {
//				console.log("Update ShareActive ID" + objMembersGame.ShareID + " Value: ", doc.value);
//				if (err) throw err;
//				callback(doc, results[0]);
//			}
//		);
		collection.updateOne({
			'_id': psid
		}, objMemberUpdate, function (err, res) {
			//neu xay ra loi
			if (err) throw err;
			//console.log("Update status Kyc Member:", err);
			callback(err, res);
		});
	},
	updateAvatarMemeber: function (psid, url, client, callback) {
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Members');
		var objMemberUpdate = {
			$set: {
				"ImgUrl": url
			}
		};
		collection.updateOne({
			'_id': psid
		}, objMemberUpdate, function (err, res) {
			//neu xay ra loi
			if (err) throw err;
			//console.log("Update status Kyc Member:", err);
			callback(null, res);
		});
	},
	updateCandidatesCodeMemeber: function (psid, CandidatesCode, client, callback) {
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Members');
		var objMemberUpdate = {
			$set: {
				"CandidatesCode": CandidatesCode
			}
		};
		collection.updateOne({
			'_id': psid
		}, objMemberUpdate, function (err, res) {
			//neu xay ra loi
			if (err) throw err;
			//console.log("Update status Kyc Member:", err);
			callback(null, res);
		});
	},
	getNextSequenceValue: function (sequenceName, client, callback) {
		let db = client.db(DATA_BASE_NAME);
		let collection = db.collection('Counters');
		collection.findAndModify({
				_id: sequenceName
			}, [], {
				$inc: {
					sequence_value: 1
				}
			}, {
				upsert: true,
				new: true
			},
			function (err, doc) {
				console.log("getNextSequenceValue: ", doc.value);
				if (err) throw err;
				callback(err, doc);
			}
		);
		// return sequenceDocument.sequence_value;
	},
	//Toanva process Users
	findUsers: function (query, client, callback) {
		// Get the Users collection
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Users');
		// Find some Users
		collection.find(query).sort({
			"_id": 1
		}).toArray(function (err, results) {
			//    assert.equal(err, null);
			if (err) {
				console.log("err:", err);
				callback(err);
			} else {
				callback(results);
			}
		});
	},
	insertUsers: function (objUser, client, callback) {

		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Users');
		//var objCallback = null;
		collection.find({
			'UserName': objUser.UserName
		}).toArray(function (err, results) {
			if (err) {
				console.log("err:", err);
			} else {
				//console.log('Kiểm tra xem tồn tại hay chưa:', results.length);
				if (results.length == 0) {
					console.log('Them tai khoan :', objUser.UserName);
					// insert Users
					collection.insertOne(objUser, function (err, res) {
						//neu xay ra loi
						if (err) throw err;
						//neu khong co loi			
						console.log('Them thanh cong :', objUser.UserName);
						callback(null, 'SUCCESS');
					});

				} else {
					//đã tồn tại
					//console.log('Tai khoan da ton tai');
					callback('ERROR_EXIST');
				}
			}
		});
	},
	editUsers: function (objUser, client, callback) {
		// Get the Users collection
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Users');
		collection.find({
			'UserName': objUser.UserName
		}).toArray(function (err, results) {
			if (err) {
				console.log("err:", err);
			} else {
				//console.log('Kiểm tra xem tồn tại hay chưa:', results.length);
				if (results.length > 0) {
					console.log('Update user:', objUser.UserName);
					// edit Users
					var objUserUpdate = {
						$set: {
							"UserName": objUser.UserName,
							"FullName": objUser.FullName,
							"Status": objUser.Status
						}
					};
					if (objUser.Password.length > 0) {
						objUserUpdate = {
							$set: {
								"Password": objUser.Password,
							}
						}
						console.log('Reset password');
					}
					collection.updateOne({
						'_id': results[0]._id
					}, objUserUpdate, function (err, res) {
						//neu xay ra loi
						if (err) throw err;
						//neu khong co loi			
						console.log("Update success");
						callback(null, res);
					});
				} else {
					//đã tồn tại
					console.log('Update fail. User not found');
					callback('Tài khoản không tồn tại');
				}
			}
		});
	},
	deleteUser: function (UserName, client, callback) {
		// Get the documents collection
		const db = client.db(DATA_BASE_NAME);
		const collection = db.collection('Users');
		var myquery = {
			UserName: UserName
		};
		collection.deleteOne(myquery, function (err, res) {
			//neu xay ra loi
			if (err) throw err;
			//neu khong co loi			
			callback(null, res);
		});
	},
	// Toanva process User - End

}
