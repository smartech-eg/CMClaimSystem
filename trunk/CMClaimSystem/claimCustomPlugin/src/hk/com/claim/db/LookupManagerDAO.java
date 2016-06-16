package hk.com.claim.db;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.apache.commons.json.JSONArray;
import org.apache.commons.json.JSONException;
import org.apache.commons.json.JSONObject;

public class LookupManagerDAO {

	public JSONArray getConFigurationData() {
		System.out.println("In DAO");
		Connection con = null;
		PreparedStatement defaultsStmt = null;
		ResultSet defaultsRs = null;
		try {

			String dataSourceName = "ECMCLAIMSDS";
			con = ConnectionManager.getConnection(dataSourceName);
			String defaultsquery = "select * from dbo.Configurations";
            System.out.println("Connected");
			JSONArray configData = new JSONArray();
			defaultsStmt=con.prepareStatement(defaultsquery);
			defaultsRs = defaultsStmt.executeQuery();
			System.out.println("Building The Data Gridm");
			configData = buildDataGridData(defaultsRs);
			return configData;
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

	public boolean saveConfigrationData(JSONObject input, String user) {
		Connection con = null;
		PreparedStatement updateValue = null;
		PreparedStatement auditStatment=null;
		try {
			String dataSourceName = "ECMCLAIMSDS";
			con = ConnectionManager.getConnection(dataSourceName);
			updateValue = con
					.prepareStatement("update Configurations set Value =? where ID= ?");
			updateValue.setString(1, input.get("Value").toString());
			updateValue.setString(2, input.get("ID").toString());
			updateValue.executeUpdate();
			String description="The User Updated "+input.get("ID")+" IN the Configration Page With Value "+input.get("Value").toString();
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
      JSONArray configData = new JSONArray();


		while (defaultsRs.next()) {
		
			JSONObject configRow = new JSONObject();
       
			
			configRow.put("ID", defaultsRs.getString("ID"));
			configRow.put("Disc", defaultsRs.getString("Disc"));
			configRow.put("Value", defaultsRs.getString("Value"));

			configData.add(configRow);

		}
		 
		return configData;
	}

}
