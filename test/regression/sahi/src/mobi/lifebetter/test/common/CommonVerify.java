package mobi.lifebetter.test.common;

// JUnit Assert framework can be used for verification

import net.sf.sahi.client.Browser;

import static org.junit.Assert.*;

public class CommonVerify {

	private Browser browser;

	public CommonVerify(Browser browser) {
		this.browser = browser;
	}

	public void verifyTextareaWithIdExists(String id) throws Exception {
		assertTrue(browser.textarea(id).exists());
	}

	public void verifyTextBoxWithIdExists(String id) throws Exception {
		assertTrue(browser.textbox(id).exists());
	}
	
	public void verifyHiddenInputWithIdExists(String id) throws Exception {
		assertTrue(browser.hidden(id).exists());
	}
	
	public void verifyContentOfDivIs (String id, String content) {
		String divText = browser.div(id).getText();
		assertEquals(content, divText);
	}

	public void verifyDivWithIdExists(String divId) throws Exception {
		assertTrue(browser.div(divId).exists());
	}

	public void verifyDivWithIdIsNotDisplay(String id)
			throws Exception {
		assertFalse(browser.div(id).isVisible());
	}

}
