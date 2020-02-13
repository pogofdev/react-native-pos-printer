import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  TouchableOpacity
} from "react-native";
import {
  RNPosPrinter,
  PrinterConstants,
  printerCommand
} from "react-native-pos-printer";
import RNFetchBlob from "rn-fetch-blob";

const receipt = {
  logoURL: "https://www.hengleasing.com/wp-content/uploads/2019/02/Asset-3.png",
  TIN: "0505558011250",
  addressLine1: "69 หมู่ 7 ต.สันทรายน้อย อ.สันทราย",
  addressLine2: "จ.เชียงใหม่ 50210",
  receiptNo: "000162100001",
  customerName: "พิชิด เดชซ้อน",
  contractNo: "630001PL00004",
  receiptDate: "14/02/2563",
  receiptTime: "00:00",
  receiptAmount: "4,500",
  collectorName: "พิชิด เดชซ้อน",
  barcode() {
    return `${receipt.receiptNo}\r\n${receipt.contractNo}\r\n${receipt.receiptAmount}`;
  }
};

const App = () => {
  const [devices, setDevices] = useState([]);

  const getDevices = () => {
    console.log("getDevices");

    RNPosPrinter.getDevices()
      .then(devices => setDevices(devices))
      .catch(err => console.log(err));
  };

  const connectDevice = device => {
    console.log("connectDevice");

    RNPosPrinter.connectDevice(device.identifier)
      .then(res => console.log(res))
      .catch(err => console.log(err));
  };

  const printTestReceipt = async () => {
    console.log("printTestReceipt");

    const cmd = [
      printerCommand.setPrinter(PrinterConstants.Command.CODE_PAGE, 26)
    ];

    const logo = await RNFetchBlob.config({
      path: `${RNFetchBlob.fs.dirs.DownloadDir}/heng_logo.png`
    }).fetch("GET", receipt.logoURL);
    cmd.push(printerCommand.printImageFromStorage(logo.path(), 250, 70));

    cmd.push(
      printerCommand.setPrinter(
        PrinterConstants.Command.ALIGN,
        PrinterConstants.Command.ALIGN_CENTER
      ),
      printerCommand.setPrinter(PrinterConstants.Command.FONT_MODE, 1),
      printerCommand.printLine(`เลขที่ประจําตัวผู้เสียภาษี: ${receipt.TIN}`),
      printerCommand.printLine(receipt.addressLine1),
      printerCommand.printLine(receipt.addressLine2),
      printerCommand.printSeparator30("-------"),
      printerCommand.printLine("")
    );

    cmd.push(
      printerCommand.setPrinter(
        PrinterConstants.Command.ALIGN,
        PrinterConstants.Command.ALIGN_LEFT
      ),
      printerCommand.setPrinter(PrinterConstants.Command.FONT_MODE, 0),
      printerCommand.printLine(`เลขที่ใบเสร็จรับเงิน: ${receipt.receiptNo}`),
      printerCommand.printLine(`ชื่อลูกค้า: ${receipt.customerName}`),
      printerCommand.printLine(`เลขที่สัญญา: ${receipt.contractNo}`),
      printerCommand.printLine(`วันที่ชำระเงิน: ${receipt.receiptDate}`),
      printerCommand.printLine(`เวลา: ${receipt.receiptTime}`),
      printerCommand.printLine(`จำนวนเงินที่ชำระ: ${receipt.receiptAmount}`),
      printerCommand.printLine(`ชำระโดย: เงินสด`),
      printerCommand.printLine(`ผู้รับเงิน: ${receipt.collectorName}`),
      printerCommand.setPrinter(PrinterConstants.Command.FONT_MODE, 1),
      printerCommand.printLine(""),
      printerCommand.setPrinter(
        PrinterConstants.Command.ALIGN,
        PrinterConstants.Command.ALIGN_CENTER
      ),
      printerCommand.printSeparator30("-------"),
      printerCommand.printLine("")
    );

    cmd.push(
      printerCommand.setPrinter(
        PrinterConstants.Command.ALIGN,
        PrinterConstants.Command.ALIGN_CENTER
      ),
      printerCommand.setPrinter(PrinterConstants.Command.FONT_MODE, 1),
      printerCommand.printLine("โปรดตรวจสอบรายการชำระเงินของท่าน"),
      printerCommand.printLine(""),
      printerCommand.printBarCode(
        PrinterConstants.BarcodeType.CODE128,
        10,
        10,
        10,
        receipt.barcode()
      ),
      printerCommand.printLine(""),
      printerCommand.printLine("")
    );

    try {
      await RNPosPrinter.printerModule.addCommands(cmd);
      if (this.deviceEventEmitter) this.deviceEventEmitter.remove();
      console.log("Done");
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    console.log(RNPosPrinter);

    RNPosPrinter.init()
      .then(res => console.log(res))
      .catch(err => console.log(err));
  });

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text>Devices:</Text>
        <FlatList
          data={devices}
          keyExtractor={device => device.identifier}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity onPress={() => connectDevice(item)}>
                <View>
                  <Text>Identifier: {item.identifier}</Text>
                  <Text>Name: {item.name}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
        <Button title="Get Devices" onPress={() => getDevices()} />
      </View>
      <View style={styles.box}>
        <Button title="Print Test Receipt" onPress={() => printTestReceipt()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  box: {
    margin: 10
  }
});

export default App;
