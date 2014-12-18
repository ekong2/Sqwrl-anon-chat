package edu.jhu.cs.oosegroup5.fbanonchat.server;

import edu.jhu.cs.oosegroup5.fbanonchat.client.FacebookProfile;

/**
 * A handler to communicate with the Facebook API
 * 
 * @author johnlee
 *
 */
public interface FacebookApiHandler {
	/**
	 * Initializes a connection with Facebook based on a set of API credentials
	 * 
	 * @param credentials
	 * @return
	 */
	public boolean establishConnection();

	/**
	 * Retrieves Facebook information about a Faceboo profile based on a unique
	 * identifier for the Graph API
	 * 
	 * @param uuid
	 *            The unique identifier
	 * @return The Facebook profile of the user
	 */
	public FacebookProfile retrieveUserInformation(String uuid);
}
