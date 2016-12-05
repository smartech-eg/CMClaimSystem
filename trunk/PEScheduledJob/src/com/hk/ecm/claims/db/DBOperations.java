package com.hk.ecm.claims.db;

import java.lang.reflect.Array;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.hk.ecm.claims.Model.Claim;
import com.hk.ecm.claims.connection.ConnectionManager;
import com.hk.ecm.claims.utils.ConfigurationManager;

public class DBOperations {

	public DBOperations() {

	}

	public String getWorkItemStatus(Connection dbConnection,
			String workItemProperty) {

		String tableName = ConfigurationManager.configuration.get("Table_Name");
		String statusColName = ConfigurationManager.configuration
				.get("Status_Col_Name");
		String filterColName = ConfigurationManager.configuration
				.get("Filter_Col_Name");

		String status = null;
		String dbQuery = "select " + filterColName + " from " + tableName
				+ " where " + statusColName + " = '" + workItemProperty + "'";
		System.out.println(">> >>Database Query " + dbQuery);
		PreparedStatement stmt = null;
		ResultSet rs = null;
		try {
			stmt = dbConnection.prepareStatement(dbQuery);
			rs = stmt.executeQuery();

			while (rs.next()) {
				status = rs.getString(filterColName);
				System.out.println(">>Retrieving the status value, it equals"
						+ status);
			}

		} catch (SQLException e) {
			e.printStackTrace();
		} finally {

			ConnectionManager.closeResource(stmt);
			ConnectionManager.closeResource(rs);
		}
		return status;
	}

	public String getWorkItemPaymentStatus(Connection dbConnection,
			String workItemProperty) {

		String tableName = ConfigurationManager.configuration.get("Table_Name");
		String statusColName = ConfigurationManager.configuration
				.get("Status_Col_Name");
		String filterColName = ConfigurationManager.configuration
				.get("Payment_Filter_Col_Name");

		String status = null;
		String dbQuery = "select " + filterColName + " from " + tableName
				+ " where " + statusColName + " = '" + workItemProperty + "'";
		System.out.println(">> >>Database Query " + dbQuery);
		PreparedStatement stmt = null;
		ResultSet rs = null;
		try {
			stmt = dbConnection.prepareStatement(dbQuery);
			rs = stmt.executeQuery();

			while (rs.next()) {
				status = rs.getString(filterColName);
			}

		} catch (SQLException e) {
			e.printStackTrace();
		} finally {

			ConnectionManager.closeResource(stmt);
			ConnectionManager.closeResource(rs);
		}
		return status;
	}

	public static HashMap<String, String> loadConfigurations() {
		ConnectionManager connectionManager = new ConnectionManager();
		Connection dbConnection = connectionManager.getDBConnection();
		Map<String, String> configurations = new HashMap<String, String>();

		String dbQuery = "select ID , Value from Configurations";
		PreparedStatement stmt = null;
		ResultSet rs = null;
		try {
			stmt = dbConnection.prepareStatement(dbQuery);
			rs = stmt.executeQuery();

			while (rs.next()) {

				configurations.put(rs.getString("ID"), rs.getString("Value"));

			}

		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
			ConnectionManager.closeConnection(dbConnection);
			ConnectionManager.closeResource(stmt);
			ConnectionManager.closeResource(rs);
		}

		return (HashMap<String, String>) configurations;
	}

	public ArrayList<String> getTerminatedCaseIds(Connection dbConnection,
			String terminateColName, String caseIDColName,String terminateColvalue) {
		
		String processFlagColName=ConfigurationManager.configuration.get("ProcessFlag");
		String processDateColName=ConfigurationManager.configuration.get("ProcessDate");
		
		String terminatedColName=ConfigurationManager.configuration.get("TerminatedFlag");
        String processFlagValue=ConfigurationManager.configuration.get("ProcessFlagValue");
        
		String tableName = ConfigurationManager.configuration.get("Table_Name");

		ArrayList<String> caseIds = new ArrayList<String>();
		/*String dbQuery = "select " + caseIDColName + " from " + tableName
				+ " where " + terminateColName + "='"+terminateColvalue+"'";*/
		
	
		String dbQuery ="SELECT " + caseIDColName + " from " + tableName
		+ " where (" + terminateColName + "='"+terminateColvalue+"'or "
				+ "("+processFlagColName+"='"+processFlagValue+"' And "+processDateColName+" IS NOT NULL) or ( glpaystat !='RQ' and glpaystat IS NOT NULL))"
						+ " and "+terminatedColName+"='0'";
		
		
		System.out.println(">> >>Database Query " + dbQuery);
		PreparedStatement stmt = null;
		ResultSet rs = null;
		try {
			stmt = dbConnection.prepareStatement(dbQuery);
			rs = stmt.executeQuery();

			while (rs.next()) {
				caseIds.add(rs.getString(caseIDColName));
				System.out.println(">>Case id " + rs.getString(caseIDColName)
						+ " Should be Terminated");
			}

		} catch (SQLException e) {
			e.printStackTrace();
		} finally {

			ConnectionManager.closeResource(stmt);
			ConnectionManager.closeResource(rs);
		}
		return caseIds;
	}
	


public void updateTerminateStatus(Connection dbConnection,
		String terminateColName, String caseIDColName, String caseId) {

	String tableName = ConfigurationManager.configuration.get("Table_Name");

	ArrayList<String> caseIds = new ArrayList<String>();
	String dbQuery = "UPDATE " + tableName + " set " + terminateColName
			+ "='1' where " + caseIDColName + "='" + caseId+"'";
	System.out.println(">> >>Database Query " + dbQuery);
	PreparedStatement stmt = null;

	try {
		stmt = dbConnection.prepareStatement(dbQuery);
		stmt.executeUpdate();
	} catch (Exception e) {
		e.printStackTrace();
	} finally {

		ConnectionManager.closeResource(stmt);
	}

}

	public String getWorkItemAmount(Connection dbConnection,
			String filterdWorkItemPropertyValue) {

		String tableName = ConfigurationManager.configuration.get("Table_Name");
		String filteredColName = ConfigurationManager.configuration
				.get("Status_Col_Name");
		String amountColName = ConfigurationManager.configuration
				.get("Amount_Col_Name");

		String status = null;
		String dbQuery = "select " + amountColName + " from " + tableName
				+ " where " + filteredColName + " = '"
				+ filterdWorkItemPropertyValue + "'";
		System.out.println(">> >>Database Query " + dbQuery);
		PreparedStatement stmt = null;
		ResultSet rs = null;
		try {
			stmt = dbConnection.prepareStatement(dbQuery);
			rs = stmt.executeQuery();

			while (rs.next()) {
				status = rs.getString(amountColName);
				System.out.println(">>Retrieving the amount value, it equals"
						+ status);
			}

		} catch (SQLException e) {
			e.printStackTrace();
		} finally {

			ConnectionManager.closeResource(stmt);
			ConnectionManager.closeResource(rs);
		}
		return status;
	}
	
	
	public Claim getClaimProperties(Connection dbConnection,
			String filterdWorkItemPropertyValue) {

		String tableName = ConfigurationManager.configuration.get("Table_Name");
		String filteredColName = ConfigurationManager.configuration
				.get("Status_Col_Name");
		

 		String dbQuery = "select * from " + tableName
				+ " where " + filteredColName + " = '"
				+ filterdWorkItemPropertyValue + "'";
		System.out.println(">> >>Database Query " + dbQuery);
		PreparedStatement stmt = null;
		ResultSet rs = null;
		Claim claim=new Claim();
		try {
			stmt = dbConnection.prepareStatement(dbQuery);
			rs = stmt.executeQuery();

			while (rs.next()) {
				
				claim.setClaimApprovalUser(rs.getString("glcmpuser"));
				claim.setClaimCopmany(rs.getString("glclmcoy"));
				claim.setClaimNumber(rs.getString("glclaim"));
				claim.setClaimPrefix(rs.getString("glclmpfx"));
				claim.setClaimRegisterUser(rs.getString("glreguser"));
				claim.setClaimType(rs.getString("glinda"));
				claim.setDiagnosisCode(rs.getString("gldiag"));
				claim.setdOS(rs.getString("glconsultd"));
				claim.setExcludeFromStatistic(rs.getString("glindb"));
				claim.setHardCopy(rs.getString("glhardcpy"));
				claim.setHold(rs.getString("glhldclmKcer"));
				claim.setMemberHKID(rs.getString("glid"));
				claim.setMemberHoldClaimIndicator(rs.getString("glhldclmKcer"));
				claim.setMemberNumber(rs.getString("glcert"));
				claim.setMemberName(rs.getString("certname"));
				claim.setMemberPrefix(rs.getString("glcertpfix"));
				claim.setMemberVIPIndicator(rs.getString("glvip"));
				claim.setPaymentStatus(rs.getString("glpaystat"));
				claim.setPendingReason(rs.getString("glpdreason"));
				claim.setPolicyName(rs.getString("policyname"));
				claim.setProviderName(rs.getString("glpctname"));
				claim.setStatus(rs.getString("glprocflg"));
				claim.setTotalPaymentAmount(rs.getString("gltotpyamt"));
				claim.setTotalShortFallAmout(rs.getString("glshortfal"));
				claim.setValidFlag(rs.getString("glvflag"));
				
			}

		} catch (SQLException e) {
			e.printStackTrace();
		} finally {

			ConnectionManager.closeResource(stmt);
			ConnectionManager.closeResource(rs);
		}
		return claim;
	}
	
	
}
