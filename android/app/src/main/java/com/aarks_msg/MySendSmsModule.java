package com.aarks_msg;
 
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException; 
import java.util.ArrayList;

import android.telephony.SmsManager;

public class MySendSmsModule extends ReactContextBaseJavaModule {
 
    public MySendSmsModule(ReactApplicationContext reactContext) {
        //required by React Native
        super(reactContext);
    }
 
    @Override
    //getName is required to define the name of the module
    public String getName() { 
        return "DirectSms";
    }
 
    @ReactMethod
    public void sendDirectSms(String phoneNumber, String msg) {
        try {  
            SmsManager smsManager = SmsManager.getDefault();
            
            // smsManager.sendTextMessage(
            //   phoneNumber, null, msg, null, null
            // );
            //the above portion sends single sms

            ArrayList<String> parts = smsManager.divideMessage(msg);

            smsManager.sendMultipartTextMessage(phoneNumber, null, parts, null, null);
        } catch (Exception ex) {
            System.out.println("couldn't send message.");
        } 
    }
}