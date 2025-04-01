// ./worker/src/main/java/worker/Worker.java
package worker;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.exceptions.JedisConnectionException;
import java.sql.*;
import java.util.Map;
import org.json.JSONObject;

class Worker {
  public static void main(String[] args) {
    try {
      Jedis redis = connectToRedis("redis");
      Connection dbConn = connectToDB("db");

      System.err.println("Connected to redis and db");

      // Create votes table if it doesn't exist
      createVotesTable(dbConn);

      while (true) {
        String voteJSON = redis.blpop(0, "votes").get(1);
        JSONObject voteData = new JSONObject(voteJSON);
        String voterId = voteData.getString("voter_id");
        String vote = voteData.getString("vote");

        System.out.printf("Processing vote for '%s' by '%s'\n", vote, voterId);
        updateVote(dbConn, voterId, vote);
      }
    } catch (SQLException e) {
      e.printStackTrace();
      System.exit(1);
    }
  }

  static void createVotesTable(Connection connection) throws SQLException {
    String createTableSQL = 
      "CREATE TABLE IF NOT EXISTS votes (" +
      "id VARCHAR(255) NOT NULL UNIQUE, " +
      "vote VARCHAR(255) NOT NULL, " +
      "PRIMARY KEY (id))";
    
    try (Statement statement = connection.createStatement()) {
      statement.executeUpdate(createTableSQL);
    }
  }

  static void updateVote(Connection connection, String voterId, String vote) throws SQLException {
    String updateSQL = 
      "INSERT INTO votes (id, vote) " +
      "VALUES (?, ?) " +
      "ON CONFLICT (id) DO UPDATE SET vote = ?";
    
    try (PreparedStatement statement = connection.prepareStatement(updateSQL)) {
      statement.setString(1, voterId);
      statement.setString(2, vote);
      statement.setString(3, vote);
      statement.executeUpdate();
    }
  }

  static Jedis connectToRedis(String host) {
    Jedis conn = new Jedis(host);

    while (true) {
      try {
        conn.ping();
        break;
      } catch (JedisConnectionException e) {
        System.err.println("Waiting for redis");
        sleep(1000);
      }
    }

    return conn;
  }

  static Connection connectToDB(String host) throws SQLException {
    Connection conn = null;

    try {
      Class.forName("org.postgresql.Driver");
    } catch (ClassNotFoundException e) {
      System.err.println("PostgreSQL JDBC driver not found");
      e.printStackTrace();
    }

    while (conn == null) {
      try {
        String url = "jdbc:postgresql://" + host + "/postgres";
        conn = DriverManager.getConnection(url, "postgres", "postgres");
      } catch (SQLException e) {
        System.err.println("Waiting for db");
        sleep(1000);
      }
    }

    return conn;
  }

  static void sleep(long duration) {
    try {
      Thread.sleep(duration);
    } catch (InterruptedException e) {
      System.exit(1);
    }
  }
}