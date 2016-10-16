package com.hk.ecm.claims.db;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import com.hk.ecm.claims.connection.ConnectionManager;
import com.hk.ecm.claims.utils.ConfigurationManager;

public class DBOperations {

	public DBOperations() {

	}

	public String  getWorkItemStatus(Connection dbConnection,String workItemProperty)
	{
		
		String tableName=ConfigurationManager.configuration.get("Table_Name");
		String statusColName=ConfigurationManager.configuration.get("Status_Col_Name");
		String filterColName=ConfigurationManager.configuration.get("Filter_Col_Name");
		
		String status=null;
		String dbQuery="select "+filterColName+" from "+tableName+" where "+ statusColName +" = '"+ workItemProperty+"'";
		System.out.println(">> >>Database Query "+dbQuery);
		PreparedStatement stmt = null;
		ResultSet rs = null;
		try {
			stmt = dbConnection.prepareStatement(dbQuery);
			rs = stmt.executeQuery();

			while (rs.next()) {
				status =rs.getString(filterColName);
				System.out.println(">>Retrieving the status value, it equals"+ status);
			}

		} catch (SQLException e) {
              e.printStackTrace();
		} finally {

			ConnectionManager.closeResource(stmt);
			ConnectionManager.closeResource(rs);
		}
		return status;
	}
	
	public String  getWorkItemPaymentStatus(Connection dbConnection,String workItemProperty)
	{
		
		String tableName=ConfigurationManager.configuration.get("Table_Name");
		String statusColName=ConfigurationManager.configuration.get("Status_Col_Name");
		String filterColName=ConfigurationManager.configuration.get("Payment_Filter_Col_Name");
		
		String status=null;
		String dbQuery="select "+filterColName+" from "+tableName+" where "+ statusColName +" = '"+ workItemProperty+"'";
		System.out.println(">> >>Database Query "+dbQuery);
		PreparedStatement stmt = null;
		ResultSet rs = null;
		try {
			stmt = dbConnection.prepareStatement(dbQuery);
			rs = stmt.executeQuery();

			while (rs.next()) {
				status =rs.getString(filterColName);
			}

		} catch (SQLException e) {
              e.printStackTrace();
		} finally {

			ConnectionManager.closeResource(stmt);
			ConnectionManager.closeResource(rs);
		}
		return status;
	}
	
	public static HashMap<String, String> loadConfigurations()
	{
		ConnectionManager connectionManager=new ConnectionManager();
	    Connection dbConnection =connectionManager.getDBConnection();
		Map<String, String> configurations=new HashMap<String, String>();
		
		
		String dbQuery="select ID , Value from Configurations";
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

	public String getWorkItemAmount(Connection dbConnection,
			String filterdWorkItemPropertyValue) {
		
		String tableName=ConfigurationManager.configuration.get("Table_Name");
		String filteredColName=ConfigurationManager.configuration.get("Status_Col_Name");
		String amountColName=ConfigurationManager.configuration.get("Amount_Col_Name");
		
		String status=null;
		String dbQuery="select "+amountColName+" from "+tableName+" where "+ filteredColName +" = '"+ filterdWorkItemPropertyValue+"'";
		System.out.println(">> >>Database Query "+dbQuery);
		PreparedStatement stmt = null;
		ResultSet rs = null;
		try {
			stmt = dbConnection.prepareStatement(dbQuery);
			rs = stmt.executeQuery();

			while (rs.next()) {
				status =rs.getString(amountColName);
				System.out.println(">>Retrieving the amount value, it equals"+ status);
			}

		} catch (SQLException e) {
              e.printStackTrace();
		} finally {

			ConnectionManager.closeResource(stmt);
			ConnectionManager.closeResource(rs);
		}
		return status;
	}
}
