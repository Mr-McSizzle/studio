// src/types/firestoreModels.ts

/**
 * Defines the structure for a task document or object.
 */
export interface FirestoreTask {
  title: string;
  description: string;
  isComplete: boolean;
  month: number; // The simulation month this task is associated with or was completed in
}

/**
 * Defines the structure for tracking puzzle progress for a specific month.
 * If you plan to track multiple puzzles simultaneously or historically directly
 * on the user document, this might become a map:
 * puzzleProgressMap?: { [monthOrPuzzleId: string]: FirestorePuzzleData };
 */
export interface FirestorePuzzleData {
  month: number;          // The simulation month this puzzle pertains to
  piecesUnlocked: number; // Number of puzzle pieces unlocked for this month's puzzle
  totalPieces: number;    // Total number of pieces for this month's puzzle
}

/**
 * Defines the structure for an item in the surprise event history array.
 */
export interface SurpriseEventHistoryItem {
  eventId: string;
  monthOccurred: number;
  outcome: 'accepted' | 'rejected' | 'expired'; // Example outcomes
  timestamp: string; // ISO date string
}


/**
 * Defines the structure for a user's document in the 'users' collection in Firestore.
 * The document ID would typically be the Firebase Auth User ID.
 */
export interface FirestoreUserDocument {
  currentMonth: number;         // User's current simulation month
  isMonthUnlocked: boolean;     // Indicates if the currentMonth's content/features are accessible

  /**
   * Progress for a specific puzzle, likely the one relevant to the 'currentMonth'.
   * Consider making this a map if users can have concurrent puzzle progresses for different months/phases.
   * e.g., puzzleProgressMap: { [month: number]: FirestorePuzzleData }
   */
  puzzleProgress?: FirestorePuzzleData;

  /**
   * A map of tasks associated with the user, where the key is the unique taskID.
   */
  tasks?: {
    [taskId: string]: FirestoreTask;
  };

  /**
   * Manages surprise events for the user.
   */
  surpriseEvents?: {
    active: string | null; // ID of the currently active surprise event, if any.
    history: SurpriseEventHistoryItem[]; // Record of past events and their outcomes.
  };


  // --- Optional additional user-specific fields ---
  // userId: string; // Typically the document ID, but can be stored explicitly if needed
  // displayName?: string;
  // email?: string; // Can be useful for denormalization, but consider privacy
  // createdAt?: string; // ISO date string, or firebase.firestore.Timestamp in backend logic
  // lastLogin?: string; // ISO date string, or firebase.firestore.Timestamp
  // preferences?: UserPreferences; // For storing user-specific settings
}

/**
 * Example for user-specific preferences, if needed.
 */
// export interface UserPreferences {
//   theme?: 'dark' | 'light';
//   notifications?: {
//     email?: boolean;
//     inApp?: boolean;
//   };
// }
