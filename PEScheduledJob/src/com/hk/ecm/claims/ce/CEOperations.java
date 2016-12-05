package com.hk.ecm.claims.ce;

import com.filenet.api.constants.RefreshMode;
import com.filenet.api.core.Connection;
import com.filenet.api.core.Domain;
import com.filenet.api.core.Factory;
import com.filenet.api.core.Folder;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.property.Properties;
import com.hk.ecm.claims.Model.Claim;
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

	public void updateAllCasePropertiesByID(String guidPropertyValue,
			String target_ObjectStorename, Claim claim) {
		


		System.out.println(">> Fetching Case Folder");
		ConnectionManager connectionManager = new ConnectionManager();

		Connection fnConnection = connectionManager.getFNConnection();

		Domain domain = Factory.Domain.getInstance(fnConnection, null);

		ObjectStore objectStore = Factory.ObjectStore.fetchInstance(domain,
				target_ObjectStorename, null);

		Folder caseFolder = Factory.Folder.fetchInstance(objectStore,
				guidPropertyValue, null);
		System.out
				.println(">> Case Folder " + caseFolder.get_FolderName() + "");
		Properties caseFolderProperties = caseFolder.getProperties();

		
caseFolderProperties.putValue("GLCL_ClaimApprovalUser",claim.getClaimApprovalUser());
		caseFolderProperties.putValue("GLCL_ClaimCopmany",claim.getClaimCopmany());
		caseFolderProperties.putValue("GLCL_ClaimNumber",claim.getClaimNumber());
		caseFolderProperties.putValue("GLCL_ClaimPrefix",claim.getClaimPrefix());
		caseFolderProperties.putValue("GLCL_ClaimRegisterUser",claim.getClaimRegisterUser());
		caseFolderProperties.putValue("GLCL_ClaimType",claim.getClaimType());
		caseFolderProperties.putValue("GLCL_DiagnosisCode",claim.getDiagnosisCode());
		caseFolderProperties.putValue("GLCL_DOS",claim.getdOS());
		caseFolderProperties.putValue("GLCL_ExcludeFromStatistic",claim.getExcludeFromStatistic());
		caseFolderProperties.putValue("GLCL_HardCopy",claim.getHardCopy());
		caseFolderProperties.putValue("GLCL_Hold",claim.getHold());
		caseFolderProperties.putValue("GLCL_MemberHKID",claim.getMemberHKID());
		caseFolderProperties.putValue("GLCL_MemberNumber",claim.getMemberNumber());
		caseFolderProperties.putValue("GLCL_MemberName",claim.getMemberName());
 		caseFolderProperties.putValue("GLCL_PaymentStatus",claim.getPaymentStatus());
		caseFolderProperties.putValue("GLCL_PendingReason",claim.getPendingReason());
		caseFolderProperties.putValue("GLCL_PolicyName",claim.getPolicyName());
		caseFolderProperties.putValue("GLCL_ProviderName",claim.getProviderName());
		caseFolderProperties.putValue("GLCL_Status",claim.getStatus());
		caseFolderProperties.putValue("GLCL_TotalPaidAmount",claim.getTotalPaymentAmount());
		caseFolderProperties.putValue("GLCL_TotalShortfallAmount",claim.getTotalShortFallAmout());
		caseFolderProperties.putValue("GLCL_ProcessFlag",claim.getProcessFlag());
		caseFolderProperties.putValue("GLCL_MemberName",claim.getMemberName());
		caseFolderProperties.putValue("GLCL_MemberVIPIndicator",claim.getMemberVIPIndicator());
		caseFolderProperties.putValue("GLCL_ValidFlag",claim.getValidFlag());
		caseFolderProperties.putValue("GLCL_MemberHoldClaimIndicator",claim.getMemberHoldClaimIndicator());
		caseFolderProperties.putValue("GLCL_MemberPrefix",claim.getMemberPrefix());
		
		caseFolder.save(RefreshMode.REFRESH);
		System.out.println("Case Folder Updated");

	
		
	}
}
