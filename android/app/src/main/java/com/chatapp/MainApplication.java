package com.chatapp;

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.psykar.cookiemanager.CookieManagerPackage;
import org.pgsqlite.SQLitePluginPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.wix.reactnativenotifications.RNNotificationsPackage;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

	private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
		@Override
		protected boolean getUseDeveloperSupport() {
			return BuildConfig.DEBUG;
		}

		@Override
		protected List<ReactPackage> getPackages() {
			long size = 50L * 1024L * 1024L; // 50 MB
			com.facebook.react.modules.storage.ReactDatabaseSupplier.getInstance(getApplicationContext()).setMaximumSize(size);
			return Arrays.<ReactPackage>asList(
					new SQLitePluginPackage(),  
					new MainReactPackage(),
					new CookieManagerPackage(),
					new VectorIconsPackage(),
					new RNNotificationsPackage(MainApplication.this)
			);
		}
	};

	@Override
	public ReactNativeHost getReactNativeHost() {
		return mReactNativeHost;
	}

	@Override
	public void onCreate() {
		super.onCreate();
		SoLoader.init(this, /* native exopackage */ false);
	}
}
