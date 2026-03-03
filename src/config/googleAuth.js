import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '629188839279-usgi695e03t4me1ei0534cjgqi24cbfh.apps.googleusercontent.com',
  offlineAccess: false,
});

export default GoogleSignin;
