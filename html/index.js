
(function () {
  // Replace this with your own API key. You can reach out to hello@getstoryteller.com
  // to obtain an API key.

  const API_KEY = window.STORYTELLER_API_KEY;

  if (!API_KEY) {
    console.error('API key is missing. Please set the STORYTELLER_API_KEY environment variable.');
    return;
  }

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
  // Define the mapping of event types to their categories
  const eventCategoryMap = {
    openedStory: 'story',
    completedStory: 'story',
    openedPage: 'story',
    completedPage: 'story',
    actionButtonTapped: null, // To be determined based on data
    shareButtonTapped: null, // To be determined based on data
    dismissedStory: 'story',
    openedClip: 'clip',
    completedLoop: 'clip',
    finishedClip: 'clip',
    dismissedClip: 'clip',
    likedClip: 'clip',
    unlikedClip: 'clip',
  };

  // Function to determine the category for events that can belong to both clip and story
  function determineCategory(type, data) {
    const category = eventCategoryMap[type];
    if (category === null) {
      // Check for properties that are unique to clips or stories
      if (data.clipId !== undefined) {
        return 'clip';
      } else if (data.storyId !== undefined) {
        return 'story';
      }
    }
    return category;
  }

  // Function to prepare the event payload
  function preparePayload(eventType, eventName, eventMetadata) {
    // Filter out undefined values
    const filteredMetadata = Object.fromEntries(
      Object.entries(eventMetadata).filter(([_, value]) => value !== undefined),
    );

    return {
      event: 'storyteller',
      eventData: { eventType, eventName },
      storyteller: filteredMetadata,
    };
  }

  // Define storyteller specific metadata for stories and clips
  const storytellerMetadata = {
    story: {
      categories: data.categories,
      categoryDetails: data.categoryDetails,
      contentLength: data.contentLength,
      currentCategory: data.currentCategory,
      dismissedReason: data.dismissedReason,
      durationViewed: data.durationViewed,
      openedReason: data.openedReason,
      pageActionText: data.pageActionText,
      pageActionUrl: data.pageActionUrl,
      pageHasAction: data.pageHasAction,
      pageId: data.pageId,
      pageIndex: data.pageIndex,
      pageTitle: data.pageTitle,
      pageType: data.pageType,
      storyDisplayTitle: data.storyDisplayTitle,
      storyId: data.storyId,
      storyIndex: data.storyIndex,
      storyPageCount: data.storyPageCount,
      storyPlaybackMode: data.storyPlaybackMode,
      storyReadStatus: data.storyReadStatus,
      storyTitle: data.storyTitle,
    },
    clip: {
      categories: data.categories,
      categoryDetails: data.categoryDetails,
      clipActionText: data.clipActionText,
      clipActionUrl: data.clipActionUrl,
      clipHasAction: data.clipHasAction,
      clipId: data.clipId,
      clipIndex: data.clipIndex,
      clipTitle: data.clipTitle,
      clipsViewed: data.clipsViewed,
      collection: data.collection,
      contentLength: data.contentLength,
      dismissedReason: data.dismissedReason,
      durationViewed: data.durationViewed,
      loopsViewed: data.loopsViewed,
      openedReason: data.openedReason,
    },
  };

  // Get the category of the event type
  const eventCategory = determineCategory(type, data);

  // If the event type is in scope, proceed
  if (eventCategory) {
    // Initialize window.dataLayer if it's not already defined
    window.dataLayer = window.dataLayer || [];

    // Prepare the payload based on the event category and data
    const payload = preparePayload(
      eventCategory,
      type,
      storytellerMetadata[eventCategory],
    );

    // Push the event data to the dataLayer
    window.dataLayer.push(payload);
    //console.log('Storyteller Activity:', type, data);
  }
}
