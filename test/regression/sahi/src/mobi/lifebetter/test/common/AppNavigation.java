package mobi.lifebetter.test.common;

// JUnit Assert framework can be used for verification

import net.sf.sahi.client.Browser;

public class AppNavigation {

	private Browser browser;

	public AppNavigation(Browser browser) {
		this.browser = browser;
	}

	public void openTheAppInBrowser(String url) throws Exception {
		browser.navigateTo(url);
		browser.waitFor(3000);
	}

}
