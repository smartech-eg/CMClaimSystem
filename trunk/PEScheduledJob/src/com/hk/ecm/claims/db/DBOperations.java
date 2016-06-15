package com.hk.ecm.claims.db;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import com.hk.ecm.claims.connection.ConnectionManager;

public class DBOperations {

	public DBOperations() {

	}

	public String  getWorkItemStatus(Connection dbConnection,String workItemProperty)
	{
		
		String tableName=ConnectionManager.myResources.getString("Table_Name");
		String statusColName=ConnectionManager.myResources.getString("Status_Col_Name");
		String filterColName=ConnectionManager.myResources.getString("Filter_Col_Name");
		
		String status=null;
		String dbQuery="select "+filterColName+" from "+tableName+" where "+ statusColName +" = "+ workItemProperty;
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
	
	public String  getWorkItemPaymentStatus(Connection dbConnection,String workItemProperty)
	{
		
		String tableName=ConnectionManager.myResources.getString("Table_Name");
		String statusColName=ConnectionManager.myResources.getString("Status_Col_Name");
		String filterColName=ConnectionManager.myResources.getString("Payment_Filter_Col_Name");
		
		String status=null;
		String dbQuery="select "+filterColName+" from "+tableName+" where "+ statusColName +" = "+ workItemProperty;
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
}
