import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  Platform,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {check, PERMISSIONS, request} from 'react-native-permissions';
import AutoHeightImage from 'react-native-auto-height-image';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1565c0',
    padding: 16,
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
  },
  center: {
    alignItems: 'center',
  },
});

const App = () => {
  const [image, setImage] = useState(null);

  const imagePicker = cropping => {
    Promise.all([check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)]).then(
      ([externalStorageStatus]) => {
        request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE).then(result => {
          if (result !== 'granted') {
            alert('Permission gak ada');
            return;
          }

          ImagePicker.openPicker({
            cropping,
            compressImageMaxWidth: 750,
          })
            .then(data => {
              setImage(data);
            })
            .catch(e => {
              alert(e?.message);
            });
        });
      },
    );
  };

  const shareText = async () => {
    try {
      await Share.open({
        url: 'https://www.google.com',
        message: 'Testing share',
      });
    } catch (e) {
      alert(e?.message);
    }
  };

  const downloadEBook = () => {
    const {config} = RNFetchBlob;
    const downloadDir = RNFetchBlob.fs.dirs.DownloadDir;
    const url =
      'https://ik.imagekit.io/10tn5i0v1n/article/fdaf25912642ea002e0958d6bc73aa2b.pdf';
    const filename = url.substring(url.lastIndexOf('/') + 1);

    if (Platform.Version < 29) {
      request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then(async result => {
        if (result !== 'granted') {
          alert('Permission denied storage');
        } else {
          return config({
            fileCache: true,
            addAndroidDownloads: {
              useDownloadManager: true,
              notification: true,
              mime: 'application/pdf',
              description: 'File downloaded by download manager.',
              path: `${downloadDir}/${filename}`,
            },
          }).fetch('GET', url);
        }
      });
    } else {
      return config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          mime: 'application/pdf',
          description: 'File downloaded by download manager.',
          path: `${downloadDir}/${filename}`,
        },
      }).fetch('GET', url);
    }
  };

  const shareImage = async () => {
    try {
      const img = await RNFS.readFile(image.path, 'base64');

      await Share.open({
        url: `data:image/jpg;base64,${img}`,
        title: 'Image',
      });
    } catch (e) {
      alert(e?.message);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <TouchableOpacity
          onPress={() => imagePicker(false)}
          style={styles.button}>
          <Text style={styles.buttonText}>Image picker without crop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => imagePicker(true)}
          style={styles.button}>
          <Text style={styles.buttonText}>Image picker with crop</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={shareText} style={styles.button}>
          <Text style={styles.buttonText}>Share Text</Text>
        </TouchableOpacity>

        {image?.path && (
          <TouchableOpacity onPress={shareImage} style={styles.button}>
            <Text style={styles.buttonText}>Share Image</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={downloadEBook} style={styles.button}>
          <Text style={styles.buttonText}>Download E-Book</Text>
        </TouchableOpacity>

        <View style={styles.center}>
          {image?.path && (
            <AutoHeightImage width={150} source={{uri: image?.path}} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
