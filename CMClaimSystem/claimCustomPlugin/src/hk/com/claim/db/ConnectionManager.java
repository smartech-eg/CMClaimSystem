package hk.com.claim.db;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;

public class ConnectionManager {

	static Logger logger = Logger.getLogger(ConnectionManager.class.getName());
	private static DataSource dataSource = null;
	public static final String CONTEXT = "context";

	private ConnectionManager() {
	}

	/**
	 *Opens a Database Connection {@link Connection} object quietly and logs the
	 * {@link Exception} that might get thrown.
	 * @return Database Connection Object
	 */
	public static Connection getConnection(String dataSourceName) {
		Connection connection = null;
		try {
			if (dataSource == null) {
				Context ctx = new InitialContext();
				dataSource = (DataSource) ctx.lookup(dataSourceName);
			}

			connection = dataSource.getConnection();
		} catch (Exception e) {
			logger.log(Level.SEVERE, CONTEXT, e);
		}
		return connection;
	}

	/**
	 * Closes the Database {@link Connection} object quietly and logs the
	 * {@link SQLException} that might get thrown.
	 * @param Connection is an Opened DataBase Connection 
	 */
	public static void closeConnection(Connection connection) {
		try {
			if (connection != null && !connection.isClosed()) {
				connection.close();
			}
		} catch (SQLException e) {
			logger.log(Level.SEVERE, CONTEXT, e);
		}

	}

	/**
	 * Closes a {@link ResultSet} object quietly and logs the
	 * {@link SQLException} that might get thrown.
	 * 
	 * @param resultSet
	 *            is the Database ResultSet of the fetched data from the
	 *            DataBase
	 */
	public static void closeResource(ResultSet resultSet) {
		try {
			if (resultSet != null && !resultSet.isClosed()) {
				resultSet.close();
			}
		} catch (SQLException e) {
			logger.log(Level.SEVERE, CONTEXT, e);
		}
	}

	/**
	 * Closes  a {@link Statement} object quietly and logs the
	 * {@link SQLException} that might get thrown.
	 * @param statement
	 *            is the Database Statement that used to fetch the data from the
	 *            Database
	 */
	public static void closeResource(Statement statement) {
		try {
			if (statement != null && !statement.isClosed()) {
				statement.close();
			}
		} catch (SQLException e) {
			logger.log(Level.SEVERE, CONTEXT, e);
		}

	}
}
