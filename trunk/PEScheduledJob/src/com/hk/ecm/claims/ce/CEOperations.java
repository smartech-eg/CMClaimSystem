package com.hk.ecm.claims.ce;

import com.filenet.api.constants.RefreshMode;
import com.filenet.api.core.Connection;
import com.filenet.api.core.Domain;
import com.filenet.api.core.Factory;
import com.filenet.api.core.Folder;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.property.Properties;
import com.hk.ecm.claims.connection.ConnectionManager;

public class CEOperations {

	public void updateCaseFolderPropertyByID(String caseFolderID,
			String objectStoreName, String popertyName, String propertyValue) {

		System.out.println(">> Fetching Case Folder");
		ConnectionManager connectionManager = new ConnectionManager();

		Connection fnConnection = connectionManager.getFNConnection();

		Domain domain = Factory.Domain.getInstance(fnConnection, null);

		ObjectStore objectStore = Factory.ObjectStore.fetchInstance(domain,
				objectStoreName, null);

		Folder caseFolder = Factory.Folder.fetchInstance(objectStore,
				caseFolderID, null);
		System.out
				.println(">> Case Folder " + caseFolder.get_FolderName() + "");
		Properties caseFolderProperties = caseFolder.getProperties();

		System.out.println("popertyName :" + popertyName);
		System.out.println("propertyValue :" + propertyValue);

		
		caseFolderProperties.putValue(popertyName, Double.parseDouble(propertyValue));

		caseFolder.save(RefreshMode.REFRESH);
		System.out.println("Case Folder Updated");

	}

	public static void main(String[] args) {
		System.out.println(">> Fetching Case Folder");
		ConnectionManager connectionManager = new ConnectionManager();

		Connection fnConnection = connectionManager.getFNConnectionUAT();

		Domain domain = Factory.Domain.getInstance(fnConnection, null);

		ObjectStore objectStore = Factory.ObjectStore.fetchInstance(domain,
				"FNTOS", null);

		Folder caseFolder = Factory.Folder.fetchInstance(objectStore,
				"{00A54E57-0000-C148-BE4B-370A1577E820}", null);
		System.out
				.println(">> Case Folder " + caseFolder.get_FolderName() + "");
		Properties caseFolderProperties = caseFolder.getProperties();

		caseFolderProperties.putObjectValue("GLCL_TotalIncurredAmount", "313");

		caseFolder.save(RefreshMode.REFRESH);
		System.out.println("Case Folder Updated");

	}
}
