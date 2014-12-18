package edu.jhu.cs.oosegroup5.fbanonchat.client;

import java.util.List;

/**
 * A user that interacts with a chat session.
 * 
 * @author johnlee
 *
 */
public abstract class ChatUser {


	/**
	 * A list of Facebook friends who are also chat users
	 */
	protected List<ChatUser> friends;

	/**
	 * A list of chat users who are blacklisted for this user
	 */
	protected List<ChatUser> blacklist;

	/**
	 * The current chat session for the user
	 */
	protected ChatSession currentSession;

	/**
	 * Gets the name of the user
	 * 
	 * @return The name of the user
	 */
	public abstract String getName();

	/**
	 * Gets the Facebook profile associated with the user
	 * 
	 * @return The Facebook profile object
	 */
	public abstract FacebookProfile getFacebookProfile();

	/**
	 * Set the name of the user
	 * 
	 * @param name
	 *            The name of the user
	 */
	public abstract void setName(String name);
	
	/**
	 * Sets the Facebook profile associated with the user
	 * 
	 * @param profile
	 *            The Facebook profile object
	 */
	public abstract void setFacebookProfile(FacebookProfile profile);
}
