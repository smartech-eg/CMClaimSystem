package hk.com.claim.db;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.apache.commons.json.JSONArray;
import org.apache.commons.json.JSONException;
import org.apache.commons.json.JSONObject;

public class UsersManagersDAO {



	public JSONArray getUsersData() {
		System.out.println("In DAO");
		Connection con = null;
		PreparedStatement defaultsStmt = null;
		ResultSet defaultsRs = null;
		try {

			String dataSourceName = "ECMCLAIMSDS";
			con = ConnectionManager.getConnection(dataSourceName);
			String defaultsquery = "select * from dbo.Users_Data";
            System.out.println("Connected");
			JSONArray usersData = new JSONArray();
			defaultsStmt=con.prepareStatement(defaultsquery);
			defaultsRs = defaultsStmt.executeQuery();
			System.out.println("Building The Data Grid");
			usersData = buildDataGridData(defaultsRs);
			return usersData;
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			ConnectionManager.closeResource(defaultsRs);
			ConnectionManager.closeResource(defaultsStmt);
			ConnectionManager.closeConnection(con);
		}

		return null;
	}

	/**
	 * Remove Redundant data from a list
	 * @param user 
	 * 
	 * @param lookupList
	 *            is Java Collection List
	 */

	public boolean saveUsersData(JSONObject input, String user) {
		Connection con = null;
		PreparedStatement updateValue = null;
		PreparedStatement auditStatment=null;
		try {
			String dataSourceName = "ECMCLAIMSDS";
			con = ConnectionManager.getConnection(dataSourceName);
			System.out.println("Connected");
			updateValue = con
					.prepareStatement("update dbo.Users_Data set User_Team= ? ,User_Group=? ,Min_Amount=? , Max_Amount=? where User_Id= ?");
		
			updateValue.setString(1, input.get("User_Team").toString());
			updateValue.setString(2, input.get("User_Group").toString());
			updateValue.setString(3, input.get("Min_Amount").toString());
			updateValue.setString(4, input.get("Max_Amount").toString());
			updateValue.setString(5, input.get("User_Id").toString());
			System.out.println("before executing updates");
			updateValue.executeUpdate();
			System.out.println("after executing updates");
			String description="The User Updated "+input.get("User_Id")+
					" IN the Users Information Page With Value "+
			input.get("User_Id").toString()+" - "+
					input.get("User_Team").toString()+" - "+input.get("User_Group").toString()+" - "+
					input.get("User_Group").toString()+" - "+input.get("Min_Amount").toString()+" - "+
					input.get("Max_Amount").toString();
			
			auditStatment=con.prepareStatement("EXEC dbo.insertAuditRecord  @Username = '"+user+"' , @Action_Description='"+description+"'");
            //EXEC dbo.insertAuditRecord  @Username = 'Michael' , @Action_Description='Michael Description'
			auditStatment.execute();
			return true;
		} catch (Exception ex) {
			ex.printStackTrace();
			return false;
		} finally {
			ConnectionManager.closeResource(auditStatment);
			ConnectionManager.closeResource(updateValue);
		    ConnectionManager.closeConnection(con);
		}

	}
	
	private JSONArray buildDataGridData(ResultSet defaultsRs)
			throws SQLException, JSONException {
      JSONArray usersArray = new JSONArray();


		while (defaultsRs.next()) {
		
			JSONObject usersData = new JSONObject();
       
			
			usersData.put("User_Id", defaultsRs.getString("User_Id"));
			usersData.put("User_Team", defaultsRs.getString("User_Team"));
			usersData.put("User_Group", defaultsRs.getString("User_Group"));
			usersData.put("Min_Amount", defaultsRs.getString("Min_Amount"));
			usersData.put("Max_Amount", defaultsRs.getString("Max_Amount"));
			
			
			usersArray.add(usersData);

		}
		 
		return usersArray;
	}


}
