import {CONNECT, SCAN} from './action';
import { eventChannel, buffers, END } from 'redux-saga';
import { takeEvery, put, call, take, cancelled, all, fork } from 'redux-saga/effects';
import { actionCreator as log } from './../Log/action';
import base64 from 'react-native-base64';
import {mixA, mixB, cipher} from '../micypher';
export function* onConnectSaga(action)
{
	const device = action.payload;
	const manager = device._manager;

	console.log('Actual device:' + device.name);
	yield put(log.addLog('Łącze z ' + device.name));

	try {
		yield call([ device, device.cancelConnection ]);
	} catch (e) {
		console.log('eetam');
	}
	const connect = yield call([ device, device.connect ]);
	yield call(console.log, connect);

	yield call([ connect, connect.discoverAllServicesAndCharacteristics ]);
	yield put(log.addLog('Serwisy i charakterystyki odkryte'));

	const servicesForDevice = yield call([ manager, manager.servicesForDevice ], device.id);
	yield put(log.addLog('Serwisy pobrane'));

	console.log("Services: ",servicesForDevice);

	const service1 = servicesForDevice.filter((service) => service.uuid === '00001800-0000-1000-8000-00805f9b34fb')[0];
	//yield call(console.log, service1);

	const service2 = servicesForDevice.filter((service) => service.uuid === '00001801-0000-1000-8000-00805f9b34fb')[0];
	//yield call(console.log, service2);

	const service3 = servicesForDevice.filter((service) => service.uuid === '0000180a-0000-1000-8000-00805f9b34fb')[0];
	//yield call(console.log, service3);

	const service4 = servicesForDevice.filter((service) => service.uuid === '0000fe95-0000-1000-8000-00805f9b34fb')[0];
	// call(console.log, service4);

	const service5 = servicesForDevice.filter((service) => service.uuid === '0000fee8-0000-1000-8000-00805f9b34fb')[0];
	//yield call(console.log, service5);

	const service6 = servicesForDevice.filter((service) => service.uuid === '01344736-0000-1000-8000-262837236156')[0];
	//yield call(console.log, service6);

	// const characteristics1 = yield call([ manager, manager.characteristicsForDevice ], service1.deviceID, service1.uuid);
	// console.log("CHARAKTERYSTYKA dla serwisu:", service1.uuid);
	// console.log(characteristics1);

	// const characteristics2 = yield call([ manager, manager.characteristicsForDevice ], service2.deviceID, service2.uuid);
	// console.log("CHARAKTERYSTYKA dla serwisu:", service2.uuid);
	// console.log(characteristics2);

	// const characteristics3 = yield call([ manager, manager.characteristicsForDevice ], service3.deviceID, service3.uuid);
	// console.log("CHARAKTERYSTYKA dla serwisu:", service3.uuid);
	// console.log(characteristics3);

	// const characteristics4 = yield call([ manager, manager.characteristicsForDevice ], service4.deviceID, service4.uuid);
	// console.log("CHARAKTERYSTYKA dla serwisu:", service4.uuid);
	// console.log(characteristics4);

	// const characteristics5 = yield call([ manager, manager.characteristicsForDevice ], service5.deviceID, service5.uuid);
	// console.log("CHARAKTERYSTYKA dla serwisu:", service5.uuid);
	// console.log(characteristics5);



	//authentication
	// service4
	const characteristics4 = yield call([ manager, manager.characteristicsForDevice ], service4.deviceID, service4.uuid);
	console.log("CHARAKTERYSTYKA dla serwisu 4:", service4.uuid);
	console.log("CZWARTA CHARAKTERSYTKA", characteristics4);
	const authInitCharacteristic = characteristics4[3];
	const authCharacteristic = characteristics4[0];
	const macAddres = "B8:7C:6F:33:8A:57";
	const reversedMac = macAddres.split(":").map(s => parseInt(s, 16)).reverse();
	console.log("reversed mac", reversedMac);
	const send1 = "0x90, 0xCA, 0x85, 0xDE";
	const productId = '131';
	const token = "37 c8 2b 4b c5 9c 83 09 de f0 13 9c";
	cipherHash = cipher(mixA(reversedMac, productId), token)
	// const cipher; 
	// const mixA;
	// const mixB;

	//1. Send 0x90, 0xCA, 0x85, 0xDE bytes to authInitCharacteristic
	console.log(authInitCharacteristic);
	const writeCharacteristicWithResponseForDevice = yield call([ manager, manager.writeCharacteristicWithResponseForDevice], authCharacteristic.deviceID, authCharacteristic.serviceUUID, authCharacteristic.uuid, send1);
	console.log(base64.decode(writeCharacteristicWithResponseForDevice.value));
	

	//2. Subscribe authCharacteristic.
	const channel = yield eventChannel((emit) => {
		let emitting = true;
		authCharacteristic._manager.monitorCharacteristicForDevice(
			authCharacteristic.deviceID,
			authCharacteristic.serviceUUID,
			authCharacteristic.uuid,
			(error, char) => {
				try {
					if (char.value !== null) {
						if (emitting) {
							// const temp = base64.decode(char.value);
							console.log('emit>>>', char);
							// emit([ error, temp ]);
							//emitting = false;
						} else {
							emit(END);
						}
					}
				} catch (e) {
					console.log('e:', e);
					console.log('error', error);
					emit(END);
				}
			}
		);
		return () => {
			console.log('sie rozlaczylo');
			// manager.stopDeviceScan();
		};
	}, buffers.expanding(1));

	//3. Send cipher(mixA(reversedMac, productID), token) to authCharacteristic
	const cipherResponse = yield call([ manager, manager.writeCharacteristicWithResponseForDevice], authCharacteristic.deviceID, authCharacteristic.serviceUUID, authCharacteristic.uuid, cipherHash);
	console.log("WCH", cipherResponse);

	//end authentication



	// const characteristics6 = yield call([ manager, manager.characteristicsForDevice ], service6.deviceID, service6.uuid);
	// console.log("CHARAKTERYSTYKA dla serwisu:", service6.uuid);
	// console.log(characteristics6);

	// yield put(log.addLog('Charakterystyki pobrane'));

	//  const characteristic = characteristics6[0];
	//  yield call(console.log, characteristic);
	//  yield put(log.addLog('Rozpoczęcie nasłuchiwania na dane'));

	// const channel = yield eventChannel((emit) => {
	// 	let emitting = true;
	// 	characteristic._manager.monitorCharacteristicForDevice(
	// 		characteristic.deviceID,
	// 		characteristic.serviceUUID,
	// 		characteristic.uuid,
	// 		(error, char) => {
	// 			try {
	// 				if (char.value !== null) {
	// 					if (emitting) {
	// 						// const temp = base64.decode(char.value);
	// 						console.log('Before emit>>>', char);
	// 						// emit([ error, temp ]);
	// 						//emitting = false;
	// 					} else {
	// 						emit(END);
	// 					}
	// 				}
	// 			} catch (e) {
	// 				console.log('e:', e);
	// 				console.log('error', error);
	// 				emit(END);
	// 			}
	// 		}
	// 	);
	// 	return () => {
	// 		console.log('sie rozlaczylo');
	// 		// manager.stopDeviceScan();
	// 	};
	// }, buffers.expanding(1));

	// try {
	// 	while (true) {
	// 		const [ error, temp ] = yield take(channel);

	// 		if (error != null) {
	// 		}
	// 		if (temp != null) {
	// 			yield call(console.log, temp);
	// 			const t = temp[0];
	// 			const h = temp[1];
	// 			const date = Date.now();
	// 			yield put(actionCreator.putTemperature(t));
	// 			yield put(actionCreator.putHumidity(h));

	// 			yield call(rsf.database.create, 'temperature', { t, date });
	// 			yield call(rsf.database.create, 'humidity', { h, date });
	// 			yield put(log.addLog('Nowe dane - T:'+t+" H:"+h));
	// 			// yield put(actionCreator.putDevice(scannedDevice));
	// 			// yield put(actionCreator.connect(scannedDevice));
	// 		}
	// 	}
	// } catch (error) {
	// } finally {
	// 	yield call(console.log, 'Temperature stopped...');
	// 	if (yield cancelled()) {
	// 		yield put(log.addLog('Zakończenie nasłuchiwania'));
	// 		yield call([ device, device.cancelConnection ]);
	// 		temperatureChannel.close();
	// 	}
	// }
}

export function* connectSaga() {
	yield takeEvery(CONNECT, onConnectSaga);
	
}

export function* scanSaga() {
	//yield takeEvery(SCAN, onScanSaga);
}

export function* kettleSaga() {
	yield all([ fork(scanSaga), fork(connectSaga) ]);
}
