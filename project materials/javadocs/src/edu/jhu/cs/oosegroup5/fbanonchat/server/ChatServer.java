package edu.jhu.cs.oosegroup5.fbanonchat.server;

import java.util.List;

import edu.jhu.cs.oosegroup5.fbanonchat.client.ChatMessage;
import edu.jhu.cs.oosegroup5.fbanonchat.client.ChatSession;
import edu.jhu.cs.oosegroup5.fbanonchat.client.ChatUser;

/**
 * The chat session handles all the interactions between the users and chat
 * session
 * 
 * @author johnlee
 *
 */
public abstract class ChatServer {

	/**
	 * A list of users who are online
	 */
	protected List<ChatUser> onlineUsers;

	/**
	 * A list of all users who are on the chat
	 */
	protected List<ChatUser> users;

	/**
	 * A list of a active chat sessions
	 */
	protected List<ChatSession> sessions;

	/**
	 * Adds a new user to the server
	 * 
	 */
	public abstract void addNewUser(ChatUser newUse);
	
	/**
	 * Creates a new chat session between two users.
	 * 
	 * @param primaryUser
	 * @param remoteUser
	 * @return
	 */
	public abstract ChatSession createNewSession(ChatUser primaryUser,
			ChatUser remoteUser);
	
	/**
	 * Removes a given chat session
	 * 
	 * @param session
	 *            The session to remove
	 */
	public abstract void removeChatSession(ChatSession session);

	/**
	 * Sends a message to the given chat session
	 * 
	 * @param session
	 * @param message
	 * @return
	 */
	public abstract boolean sendMessage(ChatSession session,
			ChatMessage message);
	
}
