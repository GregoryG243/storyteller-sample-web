(function () {
  // Replace this with your own API key. You can reach out to hello@getstoryteller.com
  // to obtain an API key.
  const API_KEY = 'd5055df5-7265-43e1-91ac-d8a26b51b29d';

  let storyRow;
  let topStoryRow;
  let storyGrid;
  let clipsRow;
  let clipsGrid;

  ready(function () {
    // This call should be made before initializing any Storyteller rows
    // For more information see https://www.getstoryteller.com/documentation/web/quickstart
    Storyteller.sharedInstance.initialize(API_KEY).then(function () {
      initializeStoryLists();

      // The Storyteller instance has a delegate object attached which allows your code
      // to take actions based on events which happen inside the Storyteller SDK
      // For more information on the various delegate callbacks, please see
      // https://www.getstoryteller.com/documentation/web/storyteller-delegate
      Storyteller.sharedInstance.delegate = {
        // This callback is used to inform your code about actions which a user
        // takes inside Storyteller. Here we are logging the relevant information
        // to the console, but see the NextJS sample for an example of sending
        // this data to Amplitude.
        // For more information on the events and associated data, please see:
        // https://www.getstoryteller.com/documentation/web/analytics
        onUserActivityOccurred: (type, data) =>
          handleStorytellerEvent(type, data),
      };
    });
  });

  function initializeStoryLists() {
    // This method creates a new Stories row, replacing the div with id "default-stories"
    // For more information on creating Storyteller lists, please see
    // https://www.getstoryteller.com/documentation/web/storyteller-row-view
    //
    // The row will display stories from the category with ID "game-stories"
    // For more information on stories and categories, please see
    // https://www.getstoryteller.com/user-guide/stories-and-scheduling/categories
    //
    // Finally, the row has a delegate object attached which allows your code
    // to take actions based on events which happen inside the Storyteller SDK
    // For more information on the various delegate callbacks, please see
    // https://www.getstoryteller.com/documentation/web/storyteller-list-view-delegate
    storyRow = new Storyteller.StorytellerStoriesRowView('default-stories', [
      'eurosport-top-stories',
    ]);
    storyRow.delegate = {
      // This function is called when the Story data has been loaded from our API
      // In the sample implementation, we check if there was an error or if no
      // stories were returned and if so, we find the relevant element and hide it
      // In general, we recommend this as a sensible approach in most cases
      onDataLoadComplete: (success, error, dataCount) => {
        if (error || dataCount === 0) {
          document.getElementById('default-stories').style.display = 'none';
        }
      },
    };

    topStoryRow = new Storyteller.StorytellerStoriesRowView('top-stories-row', [
      'olympics-top-stories',
    ]);
    topStoryRow.delegate = {
      onDataLoadComplete: (success, error, dataCount) => {
        if (error || dataCount === 0) {
          document.getElementById('top-stories-row').style.display = 'none';
        }
      },
    };

    storyGrid = new Storyteller.StorytellerStoriesGridView('stories-grid', [
      'olympics-top-stories',
    ]);

    // This method creates a new Clips row, replacing the div with id "clips-row"
    // For more information on creating Storyteller lists, please see
    // https://www.getstoryteller.com/documentation/web/storyteller-row-view
    //
    // The row will display clips from the collection with ID "game-clips"
    // For more information on clips and collections, please see
    // https://www.getstoryteller.com/user-guide/clips-and-collections/creating-collections
    //

    clipsRow = new Storyteller.StorytellerClipsRowView(
      'clips-row',
      'eurosport-clips',
    );

    clipsGrid = new Storyteller.StorytellerClipsGridView(
      'clips-grid',
      'eurosport-clips',
    );
  }
})();

// This is a boilerplate function from https://youmightnotneedjquery.com/#ready
function ready(fn) {
  if (
    document.attachEvent
      ? document.readyState === 'complete'
      : document.readyState !== 'loading'
  ) {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function handleStorytellerEvent(type, data) {
  // Define the mapping of event types to their categories and metadata structure
  const eventTypes = {
    story: ['openedStory', 'completedStory', 'openedPage', 'completedPage', 'actionButtonTapped', 'shareButtonTapped', 'dismissedStory'],
    clips: ['openedStory', 'completedStory', 'openedPage', 'completedPage', 'actionButtonTapped', 'shareButtonTapped', 'dismissedStory'],
    // poll: ['pollStarted', 'pollCompleted'], // Example future event types
    // ad: ['adStarted', 'adCompleted'],       // Example future event types
    // quiz: ['quizStarted', 'quizCompleted']  // Example future event types
  };

  // Function to get the category of an event type
  function getEventCategory(eventType) {
    for (const category in eventTypes) {
      if (eventTypes[category].includes(eventType)) {
        return category;
      }
    }
    return null;
  }

  // Check if the event type is in scope
  const eventCategory = getEventCategory(type);
  if (eventCategory) {
    // Initialize window.dataLayer if it's not already defined
    window.dataLayer = window.dataLayer || [];

    // Prepare the common event data structure
    const payload = {
      event: 'storytellerEvent',
      eventData: {
        eventType: eventCategory,
        eventName: type
      }
    };

    // Add the story specific metadata if the event is a storyteller story event
    if (eventCategory === 'story') {
      payload.storyteller = {
        categories: data.categories,
        categoryDetails: data.categoryDetails,
        currentCategory: data.currentCategory,
        openedReason: data.openedReason,
        dismissedReason: data.dismissedReason,
        pageId: data.pageId,
        pageIndex: data.pageIndex,
        pageType: data.pageType,
        storyId: data.storyId,
        storyIndex: data.storyIndex,
        storyPageCount: data.storyPageCount,
        storyPlaybackMode: data.storyPlaybackMode,
        storyReadStatus: data.storyReadStatus,
        storyTitle: data.storyTitle,
        storyDisplayTitle: data.storyDisplayTitle,
        contentLength: data.contentLength,
        pageActionText: data.pageActionText,
        pageActionUrl: data.pageActionUrl,
        pageHasAction: data.pageHasAction
      };
    }

    // Add additional logic for other categories (poll, ad, quiz) here in the future
    // Example:
    // if (eventCategory === 'poll') {
    //   payload.poll = {
    //     pollId: data.pollId,
    //     pollQuestion: data.pollQuestion,
    //     pollOptions: data.pollOptions,
    //     selectedOption: data.selectedOption
    //   };
    // }

    // Push the event data to the dataLayer
    window.dataLayer.push(payload);
  }
}


