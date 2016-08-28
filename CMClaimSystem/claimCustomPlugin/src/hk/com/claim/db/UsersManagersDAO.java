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
			String defaultsquery = "select * from dbo.User_Data";
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
	 * @param con 
	 * 
	 * @param lookupList
	 *            is Java Collection List
	 */

	public boolean saveUsersData(JSONObject input, String user, Connection con) {
		;
		PreparedStatement updateValue = null;
		PreparedStatement auditStatment=null;
		try {
			
			System.out.println("Connected");
			updateValue = con
					.prepareStatement("update dbo.User_Data set User_Id= ?, User_Team= ? ,User_Group=? ,Min_Amount=? , Max_Amount=? where ID=?");
		
			updateValue.setString(1, input.get("User_Id").toString());
			updateValue.setString(2, input.get("User_Team").toString());
			updateValue.setString(3, input.get("User_Group").toString());
			updateValue.setInt(4,Integer.parseInt(input.get("Min_Amount").toString()));
			updateValue.setInt(5,Integer.parseInt(input.get("Max_Amount").toString()));
			updateValue.setInt(6, Integer.parseInt(input.get("ID").toString()));
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
		}

	}
	
	private JSONArray buildDataGridData(ResultSet defaultsRs)
			throws SQLException, JSONException {
      JSONArray usersArray = new JSONArray();


		while (defaultsRs.next()) {
		
			JSONObject usersData = new JSONObject();
       
			usersData.put("ID", defaultsRs.getString("ID"));
			usersData.put("User_Id", defaultsRs.getString("User_Id"));
			usersData.put("User_Team", defaultsRs.getString("User_Team"));
			usersData.put("User_Group", defaultsRs.getString("User_Group"));
			usersData.put("Min_Amount", defaultsRs.getString("Min_Amount"));
			usersData.put("Max_Amount", defaultsRs.getString("Max_Amount"));
			
			
			usersArray.add(usersData);

		}
		 
		return usersArray;
	}

	public boolean insertUsersData(JSONObject input, String user,Connection con) {

 		PreparedStatement insertedValue = null;
		PreparedStatement auditStatment=null;
		try {
			
			System.out.println("Connected");
			insertedValue = con
					.prepareStatement("insert into dbo.User_Data (User_Id,User_Team,User_Group,Min_Amount,Max_Amount) values (?,?,?,?,?)");
		
			insertedValue.setString(1, input.get("User_Id").toString());
			insertedValue.setString(2, input.get("User_Team").toString());
			insertedValue.setString(3, input.get("User_Group").toString());
			insertedValue.setInt(4,Integer.parseInt(input.get("Min_Amount").toString()));
			insertedValue.setInt(5,Integer.parseInt(input.get("Max_Amount").toString()));
			
			System.out.println("before executing updates");
			insertedValue.executeUpdate();
			System.out.println("after executing updates");
			String description="The User ["+user+"] inserted "+input.get("User_Id")+
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
			ConnectionManager.closeResource(insertedValue);
		   
		}

	
		
	}

	public boolean checkUserAmount(Connection con, String user_id,
			String user_group,String user_amount) {


 		PreparedStatement stmt = null;
 		ResultSet rs = null;
 		int minAmount = 0;
 		int maxAmount = 0;
 		boolean isUserInRange = false;
 		int userAmount;
		try {
			userAmount=Integer.parseInt(user_amount);
			System.out.println("Connected");
			stmt = con
					.prepareStatement("select Min_Amount, Max_Amount from dbo.User_Data where User_Id=? and User_Group=?");
		
			stmt.setString(1, user_id);
			stmt.setString(2, user_group);
			rs=stmt.executeQuery();
			while (rs.next()) {
		        minAmount=rs.getInt("Min_Amount");
				maxAmount=rs.getInt("Max_Amount");
			}
			
			
			if(userAmount>=minAmount&&userAmount<=maxAmount)
			{
				
				isUserInRange=true;
			}
		} catch (Exception ex) {
			ex.printStackTrace();
			isUserInRange=false;
		} finally {
			ConnectionManager.closeResource(stmt);
			ConnectionManager.closeResource(rs);
		   
		}

	
		return isUserInRange;
	
		
	}

	
	public String getUserGroupFromAmount(Connection con, String user_id,String user_amount) {


 		PreparedStatement stmt = null;
 		ResultSet rs = null;
 		String userGroup=null;
 		
		try {
 			System.out.println("Connected");
			stmt = con
					.prepareStatement("SELECT User_Group FROM dbo.User_Data WHERE User_Id=? and ? BETWEEN Min_Amount AND Max_Amount");
		
			stmt.setString(1, user_id);
			stmt.setString(2, user_amount);
			rs=stmt.executeQuery();
			while (rs.next()) {
				userGroup=rs.getString("User_Group");
			
			}
			
			
		} catch (Exception ex) {
			ex.printStackTrace();
		
		} finally {
			ConnectionManager.closeResource(stmt);
			ConnectionManager.closeResource(rs);
		   
		}

	
		return userGroup;
	
		
	}

}
